# serve_api.py — Path A API with caching + per-transect scaling + NaN-safe JSON + summary + scale clamp + WGS84 lat/lon
import os, json, time
import numpy as np
import pandas as pd
import pytz, datetime as dt
import joblib, requests
from threading import RLock
from typing import Dict, Any
from math import radians, sin, cos, atan2, sqrt

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from config import (TZ, FORECAST_DAYS, OWM_ENDPOINT, OWM_WIND_STORM_THRES, OWM_API_KEY)

# ------------------------------
# Locate & validate artifacts
# ------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ART_DIR = os.getenv("ART_DIR", os.path.join(BASE_DIR, "artifacts"))
REQ = ["model_ridge.pkl", "model_features.json", "transects.csv", "typical_annual_delta_by_transect.csv"]
missing = [f for f in REQ if not os.path.exists(os.path.join(ART_DIR, f))]
if missing:
    raise RuntimeError("Artifacts missing: " + ", ".join(missing) + f"\nRun:  python {os.path.join(BASE_DIR, 'train_model.py')}")

# ------------------------------
# Load artifacts
# ------------------------------
MODEL = joblib.load(os.path.join(ART_DIR, "model_ridge.pkl"))
FEATURE_META = json.load(open(os.path.join(ART_DIR, "model_features.json"), "r"))

# Load transects; prefer enriched (with WGS84 lat/lon) if present
TRANSECTS = pd.read_csv(os.path.join(ART_DIR, "transects.csv"))
ENRICHED = os.path.join(ART_DIR, "transects_enriched.csv")
if os.path.exists(ENRICHED):
    TRANSECTS = pd.read_csv(ENRICHED)  # has mid_lat/mid_lon & endpoint lat/lon

TYPICAL = pd.read_csv(os.path.join(ART_DIR, "typical_annual_delta_by_transect.csv"))
if "transect_id" in TYPICAL:   TYPICAL["transect_id"] = TYPICAL["transect_id"].astype(int)
if "transect_id" in TRANSECTS: TRANSECTS["transect_id"] = TRANSECTS["transect_id"].astype(int)

FEATS = FEATURE_META["features"]
GLOBAL_MEAN_DELTA = float(FEATURE_META.get("global_mean_delta", 0.0))

# Columns to attach (if available) from enriched file
GEO_KEEP = ["transect_id","mid_lat","mid_lon","lat1","lon1","lat2","lon2"]

# ------------------------------
# FastAPI + CORS
# ------------------------------
app = FastAPI(title="Frankston Shoreline 7-day API (Path A)")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------
# Time helpers
# ------------------------------
def local_now(tz=TZ):
    return dt.datetime.now(pytz.timezone(tz))

def to_local(utc_sec, tz=TZ):
    return dt.datetime.fromtimestamp(utc_sec, pytz.UTC).astimezone(pytz.timezone(tz)).date()

# ------------------------------
# Simple in-memory TTL cache
# ------------------------------
OWM_CACHE_TTL_MIN = int(os.getenv("OWM_CACHE_TTL_MIN", "45"))
OWM_CACHE_TTL_SEC = OWM_CACHE_TTL_MIN * 60
_OWM_CACHE: dict[str, dict] = {}        # (lat,lon)-> json
_FORECAST_CACHE: dict[str, dict] = {}   # (lat,lon)-> payload
_CACHE_LOCK = RLock()
_now = time.time

def _cache_get(store: dict, key: str):
    with _CACHE_LOCK:
        e = store.get(key)
        if e and e["expires"] > _now():
            return e["data"]
        if e: store.pop(key, None)
    return None

def _cache_put(store: dict, key: str, data, ttl_sec: int):
    with _CACHE_LOCK:
        store[key] = {"data": data, "expires": _now() + ttl_sec}

def _loc_key(lat: float, lon: float) -> str:
    return f"{round(lat,3)},{round(lon,3)}"

# ------------------------------
# Utilities
# ------------------------------
def jfloat(x):
    """JSON-safe float: NaN/inf/None -> None"""
    try:
        if x is None: return None
        xx = float(x)
        if np.isnan(xx) or np.isinf(xx): return None
        return xx
    except Exception:
        return None

def _haversine(lon1, lat1, lon2, lat2):
    R = 6371000.0
    φ1, φ2 = radians(lat1), radians(lat2)
    λ1, λ2 = radians(lon1), radians(lon2)
    dφ, dλ = φ2-φ1, λ2-λ1
    a = sin(dφ/2)**2 + cos(φ1)*cos(φ2)*sin(dλ/2)**2
    return 2*R*atan2(sqrt(a), sqrt(1-a))

# ------------------------------
# OWM fetch & feature proxy
# ------------------------------
def fetch_owm(lat: float, lon: float, api_key: str):
    params = {"lat": lat, "lon": lon, "appid": api_key, "units": "metric", "exclude": "minutely"}
    r = requests.get(OWM_ENDPOINT, params=params, timeout=30)
    if r.status_code >= 400:
        raise HTTPException(502, f"OWM {r.status_code}: {r.text[:400]}")
    return r.json()

def owm_to_proxy(owm_json, tz=TZ, days=FORECAST_DAYS, wind_thres=OWM_WIND_STORM_THRES):
    rows=[]
    hourly = owm_json.get("hourly", []) or []
    daily  = owm_json.get("daily",  []) or []
    for h in hourly:
        rain_h = 0.0
        if isinstance(h.get("rain"), dict):
            rain_h = jfloat(h["rain"].get("1h", 0.0)) or 0.0
        elif h.get("rain") is not None:
            rain_h = jfloat(h.get("rain", 0.0)) or 0.0
        rows.append([to_local(h["dt"], tz),
                     jfloat(h.get("wind_speed", np.nan)),
                     jfloat(h.get("wind_gust", np.nan)),
                     rain_h])
    for d in daily:
        rows.append([to_local(d["dt"], tz),
                     jfloat(d.get("wind_speed", np.nan)),
                     jfloat(d.get("wind_gust", np.nan)),
                     jfloat(d.get("rain", 0.0) or 0.0) or 0.0])
    df = pd.DataFrame(rows, columns=["date","wind","gust","rain"])
    if df.empty:
        return df
    df = (df.groupby("date", as_index=False)
            .agg(wind_max=("wind","max"), gust_max=("gust","max"), rain_sum=("rain","sum")))
    today = local_now(tz).date()
    df = df[df["date"] >= today].sort_values("date").head(days).reset_index(drop=True)

    def pos(x):
        x = 0.0 if x is None else float(x)
        return max(0.0, x - wind_thres)
    df["storm_component"] = df["wind_max"].apply(lambda w: pos(w)**2)
    df["storm_proxy"] = df["storm_component"] + 0.2*df["rain_sum"]
    return df

def proxy_to_feature_row(proxy_df: pd.DataFrame):
    weekly_val = float(proxy_df["storm_proxy"].sum())
    feats = {
        "storm_days": int((proxy_df["wind_max"] >= OWM_WIND_STORM_THRES).sum()),
        "wave_power": weekly_val,
        "rain_3d_max": float(proxy_df["rain_sum"].rolling(3, min_periods=1).sum().max()),
        "storm_index": weekly_val / (weekly_val + 5.0),
    }
    return pd.DataFrame([feats])

# ------------------------------
# Core forecast (shared by GET/POST)
# ------------------------------
SCALE_CLAMP = float(os.getenv("SCALE_CLAMP", "3.0"))  # ±3x by default

def compute_forecast(lat: float, lon: float):
    api_key = OWM_API_KEY or os.getenv("OWM_API_KEY")
    if not api_key:
        raise HTTPException(500, "OWM_API_KEY not set (in config.py or environment).")

    key = _loc_key(lat, lon)

    cached = _cache_get(_FORECAST_CACHE, key)
    if cached is not None:
        return cached

    owm = _cache_get(_OWM_CACHE, key)
    if owm is None:
        owm = fetch_owm(lat, lon, api_key)
        _cache_put(_OWM_CACHE, key, owm, OWM_CACHE_TTL_SEC)

    proxy7 = owm_to_proxy(owm)
    if proxy7.empty:
        raise HTTPException(503, "No forecast data from OWM for the requested location/time.")

    frow = proxy_to_feature_row(proxy7)
    Xf = frow[FEATS].values
    delta_week_base = float(MODEL.predict(Xf)[0])

    weights = proxy7["storm_proxy"].to_numpy()
    if np.sum(weights) <= 0:
        weights = None

    results = []
    for tid in sorted(TRANSECTS["transect_id"].astype(int).tolist()):
        row = TYPICAL.loc[TYPICAL["transect_id"] == tid]
        scale = 1.0
        if not row.empty and abs(GLOBAL_MEAN_DELTA) > 1e-9:
            scale = float(row["typical_annual_delta_m"].values[0]) / GLOBAL_MEAN_DELTA
            # clamp extreme scaling to keep things sane
            scale = float(np.clip(scale, -SCALE_CLAMP, SCALE_CLAMP))

        delta_week = delta_week_base * scale

        if weights is None:
            per_day = np.repeat(delta_week / len(proxy7), len(proxy7))
        else:
            w = weights / weights.sum()
            per_day = delta_week * w

        for i, r in proxy7.iterrows():
            results.append({
                "transect_id": int(tid),
                "date": r["date"].isoformat(),
                "pred_daily_delta_m": jfloat(per_day[i]),
                "wind_max_ms": jfloat(r["wind_max"]),
                "gust_max_ms": jfloat(r["gust_max"]),
                "rain_sum_mm": jfloat(r["rain_sum"]),
            })

    # Attach typicals and geo (if available)
    pred = pd.DataFrame(results).merge(TYPICAL, on="transect_id", how="left")
    geo_cols = [c for c in GEO_KEEP if c in TRANSECTS.columns]
    if geo_cols:
        pred = pred.merge(TRANSECTS[geo_cols], on="transect_id", how="left")

    # JSON-safe replacements
    pred = pred.replace({np.nan: None})
    for c in ["mid_lat","mid_lon","lat1","lon1","lat2","lon2","typical_annual_delta_m"]:
        if c in pred.columns:
            pred[c] = pred[c].apply(jfloat)

    meta = {
        "timezone": TZ,
        "generated_at": local_now().isoformat(),
        "features_used": FEATS,
        "training_years": FEATURE_META.get("train_years"),
        "alpha": FEATURE_META.get("alpha"),
        "global_mean_delta": GLOBAL_MEAN_DELTA,
        "scale_clamp": SCALE_CLAMP,
        "cache_ttl_min": OWM_CACHE_TTL_MIN,
        "pathA": True,
    }
    out = {"meta": meta, "data": pred.to_dict(orient="records")}
    _cache_put(_FORECAST_CACHE, key, out, OWM_CACHE_TTL_SEC)
    return out

# ------------------------------
# Endpoints
# ------------------------------
@app.get("/health")
def health():
    return {
        "status": "ok",
        "features": FEATS,
        "training_years": FEATURE_META.get("train_years"),
        "alpha": FEATURE_META.get("alpha"),
        "global_mean_delta": GLOBAL_MEAN_DELTA,
        "scale_clamp": SCALE_CLAMP,
        "transects": int(TRANSECTS["transect_id"].nunique()) if "transect_id" in TRANSECTS else len(TRANSECTS),
        "cache_ttl_min": OWM_CACHE_TTL_MIN,
        "pathA": True,
        "enriched_geo": bool(all(col in TRANSECTS.columns for col in ["mid_lat","mid_lon"]))
    }

@app.get("/cache-stats")
def cache_stats():
    with _CACHE_LOCK:
        return {
            "owm_cache_entries": len(_OWM_CACHE),
            "forecast_cache_entries": len(_FORECAST_CACHE),
            "ttl_min": OWM_CACHE_TTL_MIN,
        }

@app.post("/forecast-7d")
def forecast_7d(payload: dict):
    lat = float(payload.get("lat", -38.5))
    lon = float(payload.get("lon", 145.0))
    return compute_forecast(lat, lon)

# Convenience GET (avoid JSON body)
@app.get("/forecast-7d")
def forecast_7d_get(lat: float = -38.5, lon: float = 145.0):
    return compute_forecast(lat, lon)

# Compact summary for frontend charts/tables
@app.get("/forecast-7d/summary")
def forecast_summary(lat: float = -38.5, lon: float = 145.0, k: int = 10):
    out = compute_forecast(lat, lon)   # cached
    df = pd.DataFrame(out["data"])
    if df.empty:
        return {"meta": out["meta"], "daily_totals": [], "top_transects": [], "bottom_transects": []}
    print("out: ",len(out["data"]))
    daily = (df.groupby("date", as_index=False)["pred_daily_delta_m"]
               .sum().rename(columns={"pred_daily_delta_m": "total_m"}))
    weekly = (df.groupby("transect_id", as_index=False)["pred_daily_delta_m"]
                .sum().rename(columns={"pred_daily_delta_m": "week_sum_m"})
                .sort_values("week_sum_m"))  # ascending: more negative first

    weekly = weekly.merge(TYPICAL, on="transect_id", how="left")

    # If enriched geo exists, attach midpoints for mapping
    if all(col in TRANSECTS.columns for col in ["mid_lat","mid_lon"]):
        weekly = weekly.merge(TRANSECTS[["transect_id","mid_lat","mid_lon"]], on="transect_id", how="left")

    # JSON-safe
    daily["total_m"] = daily["total_m"].apply(jfloat)
    weekly["week_sum_m"] = weekly["week_sum_m"].apply(jfloat)
    if "typical_annual_delta_m" in weekly:
        weekly["typical_annual_delta_m"] = weekly["typical_annual_delta_m"].apply(jfloat)
    for c in ["mid_lat","mid_lon"]:
        if c in weekly.columns: weekly[c] = weekly[c].apply(jfloat)

    return {
        "meta": out["meta"],
        "daily_totals": daily.to_dict(orient="records"),
        "top_transects": weekly.head(k).to_dict(orient="records"),
        "bottom_transects": weekly.tail(k).to_dict(orient="records"),
    }

# ------------------------------
# Geo helpers: list & nearest
# ------------------------------
@app.get("/transects")
def get_transects():
    df = TRANSECTS.merge(TYPICAL, on="transect_id", how="left")
    keep = ["transect_id","mid_lat","mid_lon","lat1","lon1","lat2","lon2","x1","y1","x2","y2","typical_annual_delta_m"]
    for c in keep:
        if c not in df.columns: df[c] = None
    for c in ["mid_lat","mid_lon","lat1","lon1","lat2","lon2","typical_annual_delta_m","x1","y1","x2","y2"]:
        if c in df.columns: df[c] = df[c].apply(jfloat)
    return df[keep].replace({np.nan: None}).to_dict(orient="records")

@app.get("/transects/nearest")
def nearest_transects(lat: float, lon: float, k: int = 1):
    if not all(col in TRANSECTS.columns for col in ["mid_lat","mid_lon"]):
        raise HTTPException(500, "mid_lat/mid_lon not available. Generate artifacts/transects_enriched.csv first.")
    T = TRANSECTS[["transect_id","mid_lon","mid_lat"]].copy()
    T["dist_m"] = T.apply(lambda r: _haversine(lon, lat, r["mid_lon"], r["mid_lat"]), axis=1)
    T = T.nsmallest(max(1, int(k)), "dist_m").merge(TYPICAL, on="transect_id", how="left")
    for c in ["mid_lat","mid_lon","dist_m","typical_annual_delta_m"]:
        if c in T.columns: T[c] = T[c].apply(jfloat)
    return T.replace({np.nan: None}).to_dict(orient="records")
