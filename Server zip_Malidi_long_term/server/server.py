# """
# Flask API for querying shoreline predictions from precomputed GeoJSON.

# Two separate endpoints:
# - /shorelines/long-term: Annual predictions from 2035-2100
# - /shorelines/short-term: Short-term predictions (to be configured)

# Features:
# - Loads once on startup
# - Supports filters: year exact, year range, bbox, property match
# - Returns FeatureCollection with the same shape your UI already expects
# """

# from typing import Dict, List, Optional, Iterable, Tuple
# from pathlib import Path
# from flask import Flask, jsonify, request, Response
# from flask_cors import CORS
# import orjson  # faster than json

# # ---- Config ----
# LONG_TERM_GEOJSON_PATH = Path("frankston_shorelines_annual_2035_2100.geojson")
# SHORT_TERM_GEOJSON_PATH = Path("frankston_shorelines_short_term.geojson")  # Update with actual filename
# ALLOWED_YEARS = range(1900, 2200)  # clamp & validate input years
# MAX_FEATURES = 100_000             # prevent unbounded dumps
# DEFAULT_DECIMALS = 6               # coordinate precision

# app = Flask(__name__)
# # Allow all origins, all methods, all headers
# CORS(app, resources={r"/*": {"origins": "*"}})

# # ---- In-memory stores & indices for LONG-TERM ----
# LONG_TERM_FEATURES: List[Dict] = []
# LONG_TERM_YEARS_INDEX: Dict[int, List[int]] = {}  # year -> list[feature_idx]
# LONG_TERM_GEOMS_BBOX: List[Tuple[float, float, float, float]] = []  # per-feature bbox cache

# # ---- In-memory stores & indices for SHORT-TERM ----
# SHORT_TERM_FEATURES: List[Dict] = []
# SHORT_TERM_YEARS_INDEX: Dict[int, List[int]] = {}  # year -> list[feature_idx]
# SHORT_TERM_GEOMS_BBOX: List[Tuple[float, float, float, float]] = []  # per-feature bbox cache


# def _feature_bbox(feat: Dict) -> Tuple[float, float, float, float]:
#     g = feat.get("geometry") or {}
#     t = g.get("type")
#     coords = g.get("coordinates")
#     if not t or coords is None:
#         return (0, 0, 0, 0)

#     def _minmax_xy(flat: Iterable[Iterable[float]]) -> Tuple[float, float, float, float]:
#         xs, ys = zip(*flat)  # [(lon, lat), ...]
#         return (min(xs), min(ys), max(xs), max(ys))

#     if t == "Point":
#         x, y = coords
#         return (x, y, x, y)
#     if t in ("MultiPoint", "LineString"):
#         return _minmax_xy(coords)
#     if t in ("MultiLineString", "Polygon"):
#         # Polygon: coords = [linear_ring1, linear_ring2, ...]
#         # MLS: coords = [line1, line2, ...]
#         all_xy = [xy for part in coords for xy in part]
#         return _minmax_xy(all_xy)
#     if t == "MultiPolygon":
#         all_xy = [xy for poly in coords for ring in poly for xy in ring]
#         return _minmax_xy(all_xy)

#     # Fallback for unexpected types
#     return (0, 0, 0, 0)


# def _round_coords_inplace(feat: Dict, ndigits: int = DEFAULT_DECIMALS) -> None:
#     g = feat.get("geometry") or {}
#     t = g.get("type")
#     if not t:
#         return

#     def rnd(x: float) -> float:
#         return round(float(x), ndigits)

#     def map_xy(seq):
#         return [[rnd(x), rnd(y)] for (x, y) in seq]

#     if t == "Point":
#         x, y = g["coordinates"]
#         g["coordinates"] = [rnd(x), rnd(y)]
#     elif t == "MultiPoint" or t == "LineString":
#         g["coordinates"] = map_xy(g["coordinates"])
#     elif t == "MultiLineString" or t == "Polygon":
#         g["coordinates"] = [map_xy(part) for part in g["coordinates"]]
#     elif t == "MultiPolygon":
#         g["coordinates"] = [[map_xy(ring) for ring in poly] for poly in g["coordinates"]]


# def _index_loaded_features(features_list, years_index, geoms_bbox):
#     """Index features by year and cache bounding boxes."""
#     years_index.clear()
#     geoms_bbox.clear()
#     for i, f in enumerate(features_list):
#         # index by 'year' property (adjust the key if your file uses a different name)
#         props = f.get("properties") or {}
#         year = props.get("year")
#         if isinstance(year, int):
#             years_index.setdefault(year, []).append(i)
#         # cache bbox
#         geoms_bbox.append(_feature_bbox(f))


# def _load_geojson(geojson_path: Path, features_list: List[Dict], years_index: Dict, geoms_bbox: List, data_type: str) -> None:
#     """Load a GeoJSON file into the specified data structures."""
#     if not geojson_path.exists():
#         print(f"Warning: {data_type} GeoJSON file not found: {geojson_path}")
#         return
#     # orjson loads to Python dict quickly
#     data = orjson.loads(geojson_path.read_bytes())
#     if data.get("type") != "FeatureCollection":
#         raise ValueError(f"{data_type}: Expected FeatureCollection at top level")
#     feats = data.get("features") or []
#     if not isinstance(feats, list):
#         raise ValueError(f"{data_type}: features must be a list")
#     features_list.clear()
#     features_list.extend(feats)
#     _index_loaded_features(features_list, years_index, geoms_bbox)


# def _filter_by_years(indices: Iterable[int], features_list: List[Dict], years: Optional[List[int]], yr_min: Optional[int], yr_max: Optional[int]) -> List[int]:
#     if not years and yr_min is None and yr_max is None:
#         return list(indices)

#     keep: List[int] = []
#     yrs_set = set(years or [])
#     for idx in indices:
#         y = (features_list[idx].get("properties") or {}).get("year")
#         if not isinstance(y, int):
#             continue
#         if years and y in yrs_set:
#             keep.append(idx)
#         elif yr_min is not None and yr_max is not None and (yr_min <= y <= yr_max):
#             keep.append(idx)
#         elif yr_min is not None and yr_max is None and (y >= yr_min):
#             keep.append(idx)
#         elif yr_max is not None and yr_min is None and (y <= yr_max):
#             keep.append(idx)
#     return keep


# def _filter_by_bbox(indices: Iterable[int], geoms_bbox: List, bbox: Optional[List[float]]) -> List[int]:
#     if not bbox:
#         return list(indices)
#     if len(bbox) != 4:
#         raise ValueError("bbox must be [minLon,minLat,maxLon,maxLat]")

#     xmin, ymin, xmax, ymax = bbox
#     if xmin > xmax or ymin > ymax:
#         raise ValueError("Invalid bbox ordering")

#     out: List[int] = []
#     for idx in indices:
#         bxmin, bymin, bxmax, bymax = geoms_bbox[idx]
#         if not (bxmax < xmin or bxmin > xmax or bymax < ymin or bymin > ymax):
#             out.append(idx)
#     return out


# def _filter_by_props(indices: Iterable[int], features_list: List[Dict], prop_eq: Optional[List[str]]) -> List[int]:
#     """
#     prop_eq is a list of 'key:value' pairs, e.g. ['source:DEA','scenario:SSP2']
#     """
#     if not prop_eq:
#         return list(indices)
#     pairs = []
#     for kv in prop_eq:
#         if ":" not in kv:
#             raise ValueError(f"Invalid prop filter '{kv}', expected key:value")
#         k, v = kv.split(":", 1)
#         pairs.append((k, v))
#     out: List[int] = []
#     for idx in indices:
#         props = features_list[idx].get("properties") or {}
#         if all(str(props.get(k)) == v for (k, v) in pairs):
#             out.append(idx)
#     return out


# def _fc_from_indices(indices: List[int], features_list: List[Dict], round_coords: bool = True) -> Dict:
#     # Slice without copying full geometries if you need to cap volume
#     feats = []
#     for i in indices[:MAX_FEATURES]:
#         f = features_list[i].copy()
#         # shallow copy nested dicts to avoid mutating master store
#         f["properties"] = (f.get("properties") or {}).copy()
#         f["geometry"] = (f.get("geometry") or {}).copy()
#         if round_coords:
#             _round_coords_inplace(f)
#         feats.append(f)
#     return {"type": "FeatureCollection", "features": feats}


# def _validate_years(years: Optional[List[int]], yr_min: Optional[int], yr_max: Optional[int]) -> None:
#     vals = list(years or [])
#     if yr_min is not None:
#         vals.append(yr_min)
#     if yr_max is not None:
#         vals.append(yr_max)
#     for y in vals:
#         if not isinstance(y, int) or y not in ALLOWED_YEARS:
#             raise ValueError(f"Year out of bounds: {y}")


# def _query_shorelines(features_list: List[Dict], years_index: Dict[int, List[int]], geoms_bbox: List):
#     """
#     Common logic for querying shorelines with filters.
#     Returns a Response object with GeoJSON data.
#     """
#     try:
#         # Parse query parameters
#         years_param = request.args.getlist('years', type=int)
#         years = years_param if years_param else None

#         year_min = request.args.get('year_min', type=int)
#         year_max = request.args.get('year_max', type=int)

#         bbox_param = request.args.getlist('bbox', type=float)
#         bbox = bbox_param if bbox_param else None

#         prop = request.args.getlist('prop')
#         prop = prop if prop else None

#         limit = request.args.get('limit', default=5000, type=int)
#         if limit < 1 or limit > MAX_FEATURES:
#             return jsonify({"error": f"limit must be between 1 and {MAX_FEATURES}"}), 400

#         round_decimals = request.args.get('round_decimals', default=DEFAULT_DECIMALS, type=int)
#         if round_decimals < 0 or round_decimals > 10:
#             return jsonify({"error": "round_decimals must be between 0 and 10"}), 400

#         # Validate years
#         _validate_years(years, year_min, year_max)

#         # Start with all indices or a union of year lists if specific years requested
#         if years:
#             indices = []
#             for y in years:
#                 indices.extend(years_index.get(y, []))
#         else:
#             indices = list(range(len(features_list)))

#         # Apply filters
#         indices = _filter_by_years(indices, features_list, years=None, yr_min=year_min, yr_max=year_max)
#         indices = _filter_by_bbox(indices, geoms_bbox, bbox=bbox)
#         indices = _filter_by_props(indices, features_list, prop_eq=prop)

#         # Cap the payload
#         indices = indices[:limit]

#         fc = _fc_from_indices(indices, features_list, round_coords=round_decimals is not None)
#         # Fast serialization + correct media type for maps
#         if request.headers.get('Content-Type') == 'application/json':
#             predictions = []
#             for i, f in enumerate(fc["features"][:4]):  # take 4 weeks
#                 props = f.get("properties", {})
#                 prediction = {
#                     "erosion_rate": props.get("erosion_rate", 0.8 + (i * 0.1)),
#                     "confidence": props.get("confidence", 90 + i),
#                     "image_url": f"https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=600&v={i}"
#                 }
#                 predictions.append(prediction)
#             return jsonify({
#                 "predictions": predictions,
#                 "source": "long_term_geojson",
#                 "success": True
#             })
#         else:
#             return Response(orjson.dumps(fc), mimetype="application/geo+json")

#     except ValueError as e:
#         return jsonify({"error": str(e)}), 400
#     except Exception as e:
#         return jsonify({"error": f"Internal server error: {str(e)}"}), 500


# @app.route('/')
# def home():
#     return jsonify({
#         "message": "Shoreline Prediction API",
#         "endpoints": {
#             "/shorelines/long-term": "Annual shoreline predictions 2035-2100",
#             "/shorelines/short-term": "Short-term shoreline predictions"
#         }
#     })


# @app.route('/shorelines/long-term', methods=['GET'])
# def shorelines_long_term():
#     """
#     Returns long-term shoreline predictions (annual 2035-2100).

#     Query parameters:
#     - years: Repeatable. e.g., years=2035&years=2050
#     - year_min: Minimum year filter
#     - year_max: Maximum year filter
#     - bbox: [minLon,minLat,maxLon,maxLat] e.g., bbox=144.0,-38.0,145.0,-37.0
#     - prop: Repeatable key:value filters (e.g., prop=source:DEA)
#     - limit: Max features to return (default 5000)
#     - round_decimals: Coordinate precision (default 6)
#     """
#     if not LONG_TERM_FEATURES:
#         return jsonify({"error": "Long-term data not loaded"}), 503

#     return _query_shorelines(LONG_TERM_FEATURES, LONG_TERM_YEARS_INDEX, LONG_TERM_GEOMS_BBOX)


# @app.route('/shorelines/short-term', methods=['GET'])
# def shorelines_short_term():
#     """
#     Returns short-term shoreline predictions.

#     Query parameters:
#     - years: Repeatable. e.g., years=2024&years=2025
#     - year_min: Minimum year filter
#     - year_max: Maximum year filter
#     - bbox: [minLon,minLat,maxLon,maxLat] e.g., bbox=144.0,-38.0,145.0,-37.0
#     - prop: Repeatable key:value filters (e.g., prop=source:DEA)
#     - limit: Max features to return (default 5000)
#     - round_decimals: Coordinate precision (default 6)
#     """
#     if not SHORT_TERM_FEATURES:
#         return jsonify({"error": "Short-term data not loaded"}), 503

#     return _query_shorelines(SHORT_TERM_FEATURES, SHORT_TERM_YEARS_INDEX, SHORT_TERM_GEOMS_BBOX)


# # Load GeoJSON files on startup
# with app.app_context():
#     _load_geojson(
#         LONG_TERM_GEOJSON_PATH,
#         LONG_TERM_FEATURES,
#         LONG_TERM_YEARS_INDEX,
#         LONG_TERM_GEOMS_BBOX,
#         "Long-term"
#     )
#     _load_geojson(
#         SHORT_TERM_GEOJSON_PATH,
#         SHORT_TERM_FEATURES,
#         SHORT_TERM_YEARS_INDEX,
#         SHORT_TERM_GEOMS_BBOX,
#         "Short-term"
#     )


# if __name__ == '__main__':
#     app.run(debug=True,host="0.0.0.0", port=8080)


"""
Flask API for querying shoreline predictions from precomputed GeoJSON.

Two separate endpoints:
- /shorelines/long-term: Annual predictions from 2035-2100
- /shorelines/short-term: Short-term predictions (to be configured)

Features:
- Loads once on startup
- Supports filters: year exact, year range, bbox, property match
- Returns FeatureCollection with the same shape your UI already expects
"""

from typing import Dict, List, Optional, Iterable, Tuple
from pathlib import Path
from flask import Flask, jsonify, request, Response
from flask_cors import CORS
import orjson  # faster than json

# ---- Config ----
LONG_TERM_GEOJSON_PATH = Path("frankston_shorelines_annual_2035_2100.geojson")
SHORT_TERM_GEOJSON_PATH = Path("frankston_shorelines_short_term.geojson")  # Update with actual filename
ALLOWED_YEARS = range(1900, 2200)  # clamp & validate input years
MAX_FEATURES = 100_000             # prevent unbounded dumps
DEFAULT_DECIMALS = 6               # coordinate precision

app = Flask(__name__)
# Allow all origins, all methods, all headers
CORS(app, resources={r"/*": {"origins": "*"}})

# ---- In-memory stores & indices for LONG-TERM ----
LONG_TERM_FEATURES: List[Dict] = []
LONG_TERM_YEARS_INDEX: Dict[int, List[int]] = {}  # year -> list[feature_idx]
LONG_TERM_GEOMS_BBOX: List[Tuple[float, float, float, float]] = []  # per-feature bbox cache

# ---- In-memory stores & indices for SHORT-TERM ----
SHORT_TERM_FEATURES: List[Dict] = []
SHORT_TERM_YEARS_INDEX: Dict[int, List[int]] = {}  # year -> list[feature_idx]
SHORT_TERM_GEOMS_BBOX: List[Tuple[float, float, float, float]] = []  # per-feature bbox cache


def _feature_bbox(feat: Dict) -> Tuple[float, float, float, float]:
    g = feat.get("geometry") or {}
    t = g.get("type")
    coords = g.get("coordinates")
    if not t or coords is None:
        return (0, 0, 0, 0)

    def _minmax_xy(flat: Iterable[Iterable[float]]) -> Tuple[float, float, float, float]:
        xs, ys = zip(*flat)  # [(lon, lat), ...]
        return (min(xs), min(ys), max(xs), max(ys))

    if t == "Point":
        x, y = coords
        return (x, y, x, y)
    if t in ("MultiPoint", "LineString"):
        return _minmax_xy(coords)
    if t in ("MultiLineString", "Polygon"):
        # Polygon: coords = [linear_ring1, linear_ring2, ...]
        # MLS: coords = [line1, line2, ...]
        all_xy = [xy for part in coords for xy in part]
        return _minmax_xy(all_xy)
    if t == "MultiPolygon":
        all_xy = [xy for poly in coords for ring in poly for xy in ring]
        return _minmax_xy(all_xy)

    # Fallback for unexpected types
    return (0, 0, 0, 0)


def _round_coords_inplace(feat: Dict, ndigits: int = DEFAULT_DECIMALS) -> None:
    g = feat.get("geometry") or {}
    t = g.get("type")
    if not t:
        return

    def rnd(x: float) -> float:
        return round(float(x), ndigits)

    def map_xy(seq):
        return [[rnd(x), rnd(y)] for (x, y) in seq]

    if t == "Point":
        x, y = g["coordinates"]
        g["coordinates"] = [rnd(x), rnd(y)]
    elif t == "MultiPoint" or t == "LineString":
        g["coordinates"] = map_xy(g["coordinates"])
    elif t == "MultiLineString" or t == "Polygon":
        g["coordinates"] = [map_xy(part) for part in g["coordinates"]]
    elif t == "MultiPolygon":
        g["coordinates"] = [[map_xy(ring) for ring in poly] for poly in g["coordinates"]]


def _index_loaded_features(features_list, years_index, geoms_bbox):
    """Index features by year and cache bounding boxes."""
    years_index.clear()
    geoms_bbox.clear()
    for i, f in enumerate(features_list):
        # index by 'year' property (adjust the key if your file uses a different name)
        props = f.get("properties") or {}
        year = props.get("year")
        if isinstance(year, int):
            years_index.setdefault(year, []).append(i)
        # cache bbox
        geoms_bbox.append(_feature_bbox(f))


def _load_geojson(geojson_path: Path, features_list: List[Dict], years_index: Dict, geoms_bbox: List, data_type: str) -> None:
    """Load a GeoJSON file into the specified data structures."""
    if not geojson_path.exists():
        print(f"Warning: {data_type} GeoJSON file not found: {geojson_path}")
        return
    # orjson loads to Python dict quickly
    data = orjson.loads(geojson_path.read_bytes())
    if data.get("type") != "FeatureCollection":
        raise ValueError(f"{data_type}: Expected FeatureCollection at top level")
    feats = data.get("features") or []
    if not isinstance(feats, list):
        raise ValueError(f"{data_type}: features must be a list")
    features_list.clear()
    features_list.extend(feats)
    _index_loaded_features(features_list, years_index, geoms_bbox)


def _filter_by_years(indices: Iterable[int], features_list: List[Dict], years: Optional[List[int]], yr_min: Optional[int], yr_max: Optional[int]) -> List[int]:
    if not years and yr_min is None and yr_max is None:
        return list(indices)

    keep: List[int] = []
    yrs_set = set(years or [])
    for idx in indices:
        y = (features_list[idx].get("properties") or {}).get("year")
        if not isinstance(y, int):
            continue
        if years and y in yrs_set:
            keep.append(idx)
        elif yr_min is not None and yr_max is not None and (yr_min <= y <= yr_max):
            keep.append(idx)
        elif yr_min is not None and yr_max is None and (y >= yr_min):
            keep.append(idx)
        elif yr_max is not None and yr_min is None and (y <= yr_max):
            keep.append(idx)
    return keep


def _filter_by_bbox(indices: Iterable[int], geoms_bbox: List, bbox: Optional[List[float]]) -> List[int]:
    if not bbox:
        return list(indices)
    if len(bbox) != 4:
        raise ValueError("bbox must be [minLon,minLat,maxLon,maxLat]")

    xmin, ymin, xmax, ymax = bbox
    if xmin > xmax or ymin > ymax:
        raise ValueError("Invalid bbox ordering")

    out: List[int] = []
    for idx in indices:
        bxmin, bymin, bxmax, bymax = geoms_bbox[idx]
        if not (bxmax < xmin or bxmin > xmax or bymax < ymin or bymin > ymax):
            out.append(idx)
    return out


def _filter_by_props(indices: Iterable[int], features_list: List[Dict], prop_eq: Optional[List[str]]) -> List[int]:
    """
    prop_eq is a list of 'key:value' pairs, e.g. ['source:DEA','scenario:SSP2']
    """
    if not prop_eq:
        return list(indices)
    pairs = []
    for kv in prop_eq:
        if ":" not in kv:
            raise ValueError(f"Invalid prop filter '{kv}', expected key:value")
        k, v = kv.split(":", 1)
        pairs.append((k, v))
    out: List[int] = []
    for idx in indices:
        props = features_list[idx].get("properties") or {}
        if all(str(props.get(k)) == v for (k, v) in pairs):
            out.append(idx)
    return out


def _fc_from_indices(indices: List[int], features_list: List[Dict], round_coords: bool = True) -> Dict:
    # Slice without copying full geometries if you need to cap volume
    feats = []
    for i in indices[:MAX_FEATURES]:
        f = features_list[i].copy()
        # shallow copy nested dicts to avoid mutating master store
        f["properties"] = (f.get("properties") or {}).copy()
        f["geometry"] = (f.get("geometry") or {}).copy()
        if round_coords:
            _round_coords_inplace(f)
        feats.append(f)
    return {"type": "FeatureCollection", "features": feats}


def _validate_years(years: Optional[List[int]], yr_min: Optional[int], yr_max: Optional[int]) -> None:
    vals = list(years or [])
    if yr_min is not None:
        vals.append(yr_min)
    if yr_max is not None:
        vals.append(yr_max)
    for y in vals:
        if not isinstance(y, int) or y not in ALLOWED_YEARS:
            raise ValueError(f"Year out of bounds: {y}")


def _query_shorelines(features_list: List[Dict], years_index: Dict[int, List[int]], geoms_bbox: List):
    """
    Common logic for querying shorelines with filters.
    Returns a Response object with GeoJSON data.
    """
    try:
        # Parse query parameters
        years_param = request.args.getlist('years', type=int)
        years = years_param if years_param else None

        year_min = request.args.get('year_min', type=int)
        year_max = request.args.get('year_max', type=int)

        bbox_param = request.args.getlist('bbox', type=float)
        bbox = bbox_param if bbox_param else None

        prop = request.args.getlist('prop')
        prop = prop if prop else None

        limit = request.args.get('limit', default=5000, type=int)
        if limit < 1 or limit > MAX_FEATURES:
            return jsonify({"error": f"limit must be between 1 and {MAX_FEATURES}"}), 400

        round_decimals = request.args.get('round_decimals', default=DEFAULT_DECIMALS, type=int)
        if round_decimals < 0 or round_decimals > 10:
            return jsonify({"error": "round_decimals must be between 0 and 10"}), 400

        # Validate years
        _validate_years(years, year_min, year_max)

        # Start with all indices or a union of year lists if specific years requested
        if years:
            indices = []
            for y in years:
                indices.extend(years_index.get(y, []))
        else:
            indices = list(range(len(features_list)))

        # Apply filters
        indices = _filter_by_years(indices, features_list, years=None, yr_min=year_min, yr_max=year_max)
        indices = _filter_by_bbox(indices, geoms_bbox, bbox=bbox)
        indices = _filter_by_props(indices, features_list, prop_eq=prop)

        # Cap the payload
        indices = indices[:limit]

        fc = _fc_from_indices(indices, features_list, round_coords=round_decimals is not None)
        # Fast serialization + correct media type for maps
        print("fc; ",fc)
        if request.headers.get('Content-Type') == 'application/json':
            return jsonify({
            "success": True,
            "source": "long_term_geojson",
            "model_output": fc
        })
        else:
            print("orjson.dumps(fc): ",orjson.dumps(fc))
            return Response(orjson.dumps(fc), mimetype="application/geo+json")

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

@app.route('/')
def home():
    return jsonify({
        "message": "Shoreline Prediction API",
        "endpoints": {
            "/shorelines/long-term": "Annual shoreline predictions 2035-2100",
            "/shorelines/short-term": "Short-term shoreline predictions"
        }
    })


@app.route('/shorelines/long-term', methods=['GET'])
def shorelines_long_term():
    """
    Returns long-term shoreline predictions (annual 2035-2100).

    Query parameters:
    - years: Repeatable. e.g., years=2035&years=2050
    - year_min: Minimum year filter
    - year_max: Maximum year filter
    - bbox: [minLon,minLat,maxLon,maxLat] e.g., bbox=144.0,-38.0,145.0,-37.0
    - prop: Repeatable key:value filters (e.g., prop=source:DEA)
    - limit: Max features to return (default 5000)
    - round_decimals: Coordinate precision (default 6)
    """
    if not LONG_TERM_FEATURES:
        return jsonify({"error": "Long-term data not loaded"}), 503

    return _query_shorelines(LONG_TERM_FEATURES, LONG_TERM_YEARS_INDEX, LONG_TERM_GEOMS_BBOX)


@app.route('/shorelines/short-term', methods=['GET'])
def shorelines_short_term():
    """
    Returns short-term shoreline predictions.

    Query parameters:
    - years: Repeatable. e.g., years=2024&years=2025
    - year_min: Minimum year filter
    - year_max: Maximum year filter
    - bbox: [minLon,minLat,maxLon,maxLat] e.g., bbox=144.0,-38.0,145.0,-37.0
    - prop: Repeatable key:value filters (e.g., prop=source:DEA)
    - limit: Max features to return (default 5000)
    - round_decimals: Coordinate precision (default 6)
    """
    if not SHORT_TERM_FEATURES:
        return jsonify({"error": "Short-term data not loaded"}), 503

    return _query_shorelines(SHORT_TERM_FEATURES, SHORT_TERM_YEARS_INDEX, SHORT_TERM_GEOMS_BBOX)


# Load GeoJSON files on startup
with app.app_context():
    _load_geojson(
        LONG_TERM_GEOJSON_PATH,
        LONG_TERM_FEATURES,
        LONG_TERM_YEARS_INDEX,
        LONG_TERM_GEOMS_BBOX,
        "Long-term"
    )
    _load_geojson(
        SHORT_TERM_GEOJSON_PATH,
        SHORT_TERM_FEATURES,
        SHORT_TERM_YEARS_INDEX,
        SHORT_TERM_GEOMS_BBOX,
        "Short-term"
    )


if __name__ == '__main__':
    app.run(debug=True,host="0.0.0.0", port=8080)