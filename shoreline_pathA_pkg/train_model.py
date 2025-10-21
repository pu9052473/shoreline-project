import os, re, json, math
import numpy as np
import pandas as pd
import rasterio
from rasterio.features import shapes
from shapely.geometry import shape, LineString, Point, Polygon, MultiPoint
from shapely.ops import unary_union, linemerge, transform as shp_transform
from pyproj import Transformer
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_absolute_error
import joblib

from config import (
    NDWI_DIR, WAVES_CSV, RAIN_CSV,
    TRAIN_YEAR_START, TRAIN_YEAR_END, NDWI_THRESHOLD,
    NDWI_AUTO_RESCALE, NDWI_WATER_HIGH,
    TRANSECT_SPACING_M, TRANSECT_LENGTH_M, RIDGE_ALPHA
)

ART_DIR = "./artifacts"
os.makedirs(ART_DIR, exist_ok=True)

def list_year_tifs(ndwi_dir):
    out = {}
    for f in os.listdir(ndwi_dir):
        if f.lower().endswith(".tif"):
            m = re.search(r"(\d{4})", f)
            if m:
                out[int(m.group(1))] = os.path.join(ndwi_dir, f)
    return dict(sorted(out.items()))

def raster_to_water(ndwi_path, thr=NDWI_THRESHOLD):
    """
    Binary water mask from NDWI.
    - auto-rescales if dynamic range >> 1 (e.g., 0..255)
    - adaptive threshold when thr == "auto" (60th percentile)
    - robustness for all-water / no-water masks
    """
    with rasterio.open(ndwi_path) as src:
        arr = src.read(1).astype(np.float32)
        crs = src.crs
        arr[~np.isfinite(arr)] = np.nan
        v = arr[np.isfinite(arr)]
        if v.size == 0:
            return None, crs

        vmin, vmax = float(np.nanmin(v)), float(np.nanmax(v))
        if NDWI_AUTO_RESCALE and (vmax - vmin) > 2.0:
            arr = (arr - vmin) / (vmax - vmin + 1e-9)
            v = arr[np.isfinite(arr)]

        if thr == "auto":
            thr_val = float(np.nanpercentile(v, 60.0))
        else:
            thr_val = float(thr)

        water = (arr >= thr_val).astype(np.uint8) if NDWI_WATER_HIGH else (arr <= thr_val).astype(np.uint8)
        valid = np.isfinite(arr)
        if valid.sum() == 0:
            return None, crs
        frac = float(water[valid].mean())

        if frac > 0.98 or frac < 0.02:
            alt = (arr <= thr_val).astype(np.uint8) if NDWI_WATER_HIGH else (arr >= thr_val).astype(np.uint8)
            alt_frac = float(alt[valid].mean())
            if 0.02 < alt_frac < 0.98:
                water = alt
            else:
                lo = float(np.nanpercentile(v, 35.0))
                hi = float(np.nanpercentile(v, 65.0))
                mid = 0.5 * (lo + hi)
                cand1 = (arr >= mid).astype(np.uint8); f1 = float(cand1[valid].mean())
                cand2 = (arr <= mid).astype(np.uint8); f2 = float(cand2[valid].mean())
                if 0.05 < f1 < 0.95: water = cand1
                elif 0.05 < f2 < 0.95: water = cand2
                else: water = alt if abs(alt_frac-0.5) < abs(frac-0.5) else water

        geoms = []
        for shp, val in shapes(water, transform=src.transform):
            if int(val) == 1:
                geoms.append(shape(shp))
    if not geoms:
        return None, crs
    return unary_union(geoms), crs

def coastline_from_ndwi(ndwi_path, thr=NDWI_THRESHOLD):
    polys, crs = raster_to_water(ndwi_path, thr)
    if polys is None or polys.is_empty:
        return LineString(), crs

    if isinstance(polys, Polygon):
        lines = polys.boundary
    else:
        try:
            lines = unary_union([p.boundary for p in polys.geoms])
        except Exception:
            lines = polys.boundary

    if isinstance(lines, LineString):
        return lines, crs

    try:
        merged = linemerge(lines)
        if isinstance(merged, LineString):
            return merged, crs
        longest = max(list(merged.geoms), key=lambda g: g.length)
        return longest, crs
    except Exception:
        geoms = list(getattr(lines, "geoms", []))
        if not geoms:
            return LineString(), crs
        longest = max(geoms, key=lambda g: g.length)
        return longest, crs

def to_3857(geom, src_crs):
    if not src_crs:
        transformer = Transformer.from_crs("EPSG:4326", "EPSG:3857", always_xy=True)
        return shp_transform(lambda x, y, z=None: transformer.transform(x, y), geom)
    s = str(src_crs).upper()
    if "3857" in s:
        return geom
    transformer = Transformer.from_crs(src_crs, "EPSG:3857", always_xy=True)
    return shp_transform(lambda x, y, z=None: transformer.transform(x, y), geom)

def build_transects(baseline_tif, spacing=TRANSECT_SPACING_M, half_len=TRANSECT_LENGTH_M):
    coast, crs = coastline_from_ndwi(baseline_tif)
    coast = to_3857(coast, crs)
    if coast.is_empty:
        raise RuntimeError("Baseline coastline extraction failed.")
    n = max(50, int(coast.length // spacing))
    dists = np.linspace(0, coast.length, n)
    rows = []
    for i, dcur in enumerate(dists):
        pt = coast.interpolate(dcur)
        eps = 1.0
        p1 = coast.interpolate(max(0, dcur - eps))
        p2 = coast.interpolate(min(coast.length, dcur + eps))
        dx, dy = p2.x - p1.x, p2.y - p1.y
        nx, ny = -dy, dx
        norm = math.hypot(nx, ny) + 1e-9
        nx, ny = nx / norm, ny / norm
        a = (pt.x - nx * half_len, pt.y - ny * half_len)
        b = (pt.x + nx * half_len, pt.y + ny * half_len)
        rows.append({"transect_id": i, "x1": a[0], "y1": a[1], "x2": b[0], "y2": b[1]})
    return pd.DataFrame(rows)

def shoreline_position(ndwi_path, transects_df):
    coast, crs = coastline_from_ndwi(ndwi_path)
    coast = to_3857(coast, crs)
    out = []
    for _, r in transects_df.iterrows():
        line = LineString([(r["x1"], r["y1"]), (r["x2"], r["y2"])])
        inter = line.intersection(coast)
        if inter.is_empty:
            pos = np.nan
        elif isinstance(inter, MultiPoint):
            pts = list(inter.geoms)
            mid = line.interpolate(line.length / 2)
            best = min(pts, key=lambda p: mid.distance(p))
            pos = line.project(best)
        elif inter.geom_type == "Point":
            pos = line.project(inter)
        else:
            pos = line.project(coast.interpolate(coast.length / 2))
        out.append(pos)
    return pd.DataFrame({"transect_id": transects_df["transect_id"].astype(int), "position_m": out})

def build_labels(ndwi_dir):
    year2tif = list_year_tifs(ndwi_dir)
    if not year2tif:
        raise RuntimeError(f"No .tif files found in NDWI_DIR: {ndwi_dir}")
    base_year = 2010 if 2010 in year2tif else min([y for y in year2tif if y >= 2000] or year2tif.keys())
    transects = build_transects(year2tif[base_year], spacing=TRANSECT_SPACING_M, half_len=TRANSECT_LENGTH_M)
    rows = []
    for y in sorted(year2tif):
        if y < 1970:
            continue
        pos = shoreline_position(year2tif[y], transects)
        pos["year"] = y
        rows.append(pos)
    labels = pd.concat(rows, ignore_index=True)
    return labels, transects

def load_hourly_drivers(waves_csv, rain_csv):
    w = pd.read_csv(waves_csv, parse_dates=["valid_time"])
    r = pd.read_csv(rain_csv, parse_dates=["valid_time"])
    df = pd.merge_asof(
        w.sort_values("valid_time"),
        r.sort_values("valid_time"),
        on="valid_time",
        tolerance=pd.Timedelta("5min"),
        direction="nearest"
    )
    return df

def annual_features(hourly):
    df = hourly.copy()
    df["date"] = df["valid_time"].dt.date
    df["year"] = df["valid_time"].dt.year
    daily = df.groupby(["year", "date"]).agg(
        hs_max=("swh", "max"),
        tp_mean=("mwp", "mean"),
        rain_sum=("tp", "sum"),
    ).reset_index()
    hs95 = daily.groupby("year")["hs_max"].quantile(0.95).rename("hs95")
    daily = daily.merge(hs95, on="year", how="left")
    daily["storm_day"] = (daily["hs_max"] >= daily["hs95"]).astype(int)
    daily["rain_3d"] = daily.groupby("year")["rain_sum"].transform(lambda x: x.rolling(3, min_periods=1).sum())
    annual = daily.groupby("year").agg(
        storm_days=("storm_day", "sum"),
        wave_power=("hs_max", lambda x: float(np.nansum(np.square(x)))),
        rain_3d_max=("rain_3d", "max"),
    ).reset_index()
    annual["storm_index"] = (
        0.6 * (annual["storm_days"] / (annual["storm_days"].max() + 1e-6)) +
        0.4 * (annual["wave_power"] / (annual["wave_power"].max() + 1e-6))
    )
    return annual[["year", "storm_days", "wave_power", "rain_3d_max", "storm_index"]]

def build_training(labels, feats, y0=TRAIN_YEAR_START, y1=TRAIN_YEAR_END):
    s = labels.copy()
    s = s[s["year"].between(y0, y1)].sort_values(["transect_id", "year"])
    s["delta_pos_m"] = s.groupby("transect_id")["position_m"].diff()
    s = s.dropna(subset=["delta_pos_m"])
    return s.merge(feats, on="year", how="left")

def main():
    # Sanity
    assert os.path.isdir(NDWI_DIR), f"NDWI_DIR not found: {NDWI_DIR}"
    assert os.path.isfile(WAVES_CSV), f"WAVES_CSV not found: {WAVES_CSV}"
    assert os.path.isfile(RAIN_CSV), f"RAIN_CSV not found: {RAIN_CSV}"

    print("Extracting shoreline labels…")
    labels, transects = build_labels(NDWI_DIR)
    labels.to_csv(os.path.join(ART_DIR, "shoreline_positions_annual.csv"), index=False)
    transects.to_csv(os.path.join(ART_DIR, "transects.csv"), index=False)

    print(f"Labels years: {labels['year'].min()}–{labels['year'].max()} | "
          f"years={labels['year'].nunique()} | transects={labels['transect_id'].nunique()}")

    print("Engineering annual drivers from ERA5…")
    hourly = load_hourly_drivers(WAVES_CSV, RAIN_CSV)
    feats = annual_features(hourly)
    feats.to_csv(os.path.join(ART_DIR, "annual_driver_features.csv"), index=False)
    print(f"Drivers years: {feats['year'].min()}–{feats['year'].max()} | years={feats['year'].nunique()}")

    # ---------------------------
    # >>> TRAIN: pre-trim / LOO-Year tuning
    # ---------------------------
    train = build_training(labels, feats)
    print(f"Training samples (pre-trim): {len(train)}")

    if len(train) >= 50:
        lo, hi = train["delta_pos_m"].quantile([0.01, 0.99])
        train = train[train["delta_pos_m"].between(lo, hi)]
    print(f"Training samples (post-trim): {len(train)}")

    if len(train) < 5:
        raise RuntimeError("Too few training samples after trimming. Adjust NDWI params or transects.")

    X = train[["storm_days", "wave_power", "rain_3d_max", "storm_index"]].values
    y = train["delta_pos_m"].values
    years = train["year"].values

    # LOO-Year CV for alpha
    alphas = [0.1, 0.3, 1.0, 3.0, 10.0, 30.0]
    best_alpha, best_mae = None, float("inf")
    uniq_years = np.unique(years)
    if uniq_years.size >= 3:
        for a in alphas:
            fold_mae = []
            for yr in uniq_years:
                tr = years != yr
                te = years == yr
                if te.sum() == 0 or tr.sum() == 0:
                    continue
                mdl = Ridge(alpha=a).fit(X[tr], y[tr])
                pred = mdl.predict(X[te])
                fold_mae.append(np.mean(np.abs(pred - y[te])))
            if fold_mae:
                m = float(np.mean(fold_mae))
                print(f"alpha={a:.2f} | LOO-Year MAE={m:.2f} m")
                if m < best_mae:
                    best_mae, best_alpha = m, a

    alpha_final = best_alpha if best_alpha is not None else RIDGE_ALPHA
    if best_alpha is not None:
        print(f"Selected alpha={alpha_final} (LOO-Year MAE={best_mae:.2f} m)")
    else:
        print(f"Using default alpha={alpha_final} (not enough distinct years for LOO-Year CV)")

    # Fit + save
    mdl = Ridge(alpha=alpha_final).fit(X, y)
    insample_mae = float(np.mean(np.abs(mdl.predict(X) - y)))
    print(f"In-sample MAE: {insample_mae:.2f} m on {len(y)} samples")

    typical = (
        train.groupby("transect_id")["delta_pos_m"]
        .mean()
        .rename("typical_annual_delta_m")
        .reset_index()
    )
    global_mean_delta = float(train["delta_pos_m"].mean())

    joblib.dump(mdl, os.path.join(ART_DIR, "model_ridge.pkl"))
    with open(os.path.join(ART_DIR, "model_features.json"), "w") as f:
        json.dump({
            "features": ["storm_days", "wave_power", "rain_3d_max", "storm_index"],
            "alpha": float(alpha_final),
            "train_years": [int(TRAIN_YEAR_START), int(TRAIN_YEAR_END)],
            "global_mean_delta": global_mean_delta,
            "pathA": True
        }, f, indent=2)
    typical.to_csv(os.path.join(ART_DIR, "typical_annual_delta_by_transect.csv"), index=False)

    print("Done. Artifacts saved to ./artifacts")

if __name__ == "__main__":
    main()
