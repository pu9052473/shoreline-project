# Shoreline Prediction API

Flask API for querying shoreline predictions from precomputed GeoJSON files.

## Features

- Two separate endpoints for long-term and short-term predictions
- In-memory data loading for fast queries
- Advanced filtering: year, year range, bounding box, property matching
- GeoJSON FeatureCollection responses
- Optimized with orjson for fast JSON serialization

## Installation

```bash
pip install -r requirements.txt
```

## Running the Server

```bash
python server.py
```

The server will start on `http://127.0.0.1:8080`

## API Endpoints

### Base Endpoint

**GET /** - API information and available endpoints

```bash
curl http://127.0.0.1:8080/
```

Response:
```json
{
  "message": "Shoreline Prediction API",
  "endpoints": {
    "/shorelines/long-term": "Annual shoreline predictions 2035-2100",
    "/shorelines/short-term": "Short-term shoreline predictions"
  }
}
```

### Long-term Predictions

**GET /shorelines/long-term** - Query annual shoreline predictions from 2035-2100

### Short-term Predictions

**GET /shorelines/short-term** - Query short-term shoreline predictions

## Query Parameters

Both endpoints support the same query parameters:

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `years` | int[] | Specific years (repeatable) | `years=2035&years=2050` |
| `year_min` | int | Minimum year filter | `year_min=2035` |
| `year_max` | int | Maximum year filter | `year_max=2100` |
| `bbox` | float[] | Bounding box [minLon, minLat, maxLon, maxLat] | `bbox=144.0&bbox=-38.0&bbox=145.0&bbox=-37.0` |
| `prop` | string[] | Property filters as key:value (repeatable) | `prop=source:DEA&prop=scenario:SSP2` |
| `limit` | int | Max features to return (default: 8080) | `limit=1000` |
| `round_decimals` | int | Coordinate precision 0-10 (default: 6) | `round_decimals=4` |

## Usage Examples

### Get all long-term shorelines for specific years

```bash
curl "http://127.0.0.1:8080/shorelines/long-term?years=2035&years=2050"
```

### Get shorelines within a year range

```bash
curl "http://127.0.0.1:8080/shorelines/long-term?year_min=2035&year_max=2060"
```

### Get shorelines within a bounding box

```bash
curl "http://127.0.0.1:8080/shorelines/long-term?bbox=144.0&bbox=-38.0&bbox=145.0&bbox=-37.0"
```

### Combined filters with limit

```bash
curl "http://127.0.0.1:8080/shorelines/long-term?year_min=2035&year_max=2100&limit=1000&round_decimals=4"
```

### Filter by properties

```bash
curl "http://127.0.0.1:8080/shorelines/long-term?prop=source:DEA&prop=scenario:SSP2"
```

## Response Format

All endpoints return a GeoJSON FeatureCollection:

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "LineString",
        "coordinates": [[lon1, lat1], [lon2, lat2], ...]
      },
      "properties": {
        "year": 2035,
        "source": "DEA",
        ...
      }
    },
    ...
  ]
}
```

Content-Type: `application/geo+json`

## Configuration

Edit the configuration section in [server.py](server.py:19-24):

```python
# ---- Config ----
LONG_TERM_GEOJSON_PATH = Path("frankston_shorelines_annual_2035_2100.geojson")
SHORT_TERM_GEOJSON_PATH = Path("frankston_shorelines_short_term.geojson")
ALLOWED_YEARS = range(1900, 2200)
MAX_FEATURES = 100_000
DEFAULT_DECIMALS = 6
```

### Adding Short-term Data

1. Place your short-term GeoJSON file in the server directory
2. Update `SHORT_TERM_GEOJSON_PATH` in [server.py](server.py:21) with the actual filename
3. Ensure the GeoJSON follows the same structure:
   - Top level: `FeatureCollection`
   - Features with `properties.year` as an integer
   - Valid GeoJSON geometry

## Data File Requirements

- **Format**: GeoJSON FeatureCollection
- **Year property**: Each feature must have a `properties.year` field (integer)
- **Geometry**: Any valid GeoJSON geometry type (Point, LineString, Polygon, etc.)
- **Location**: Place GeoJSON files in the same directory as server.py

## Error Responses

```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- `400` - Bad request (invalid parameters)
- `503` - Service unavailable (data not loaded)
- `500` - Internal server error

## Performance

- Data is loaded once at startup and kept in memory
- Features are indexed by year for fast filtering
- Bounding boxes are pre-computed for efficient spatial queries
- Uses orjson for fast JSON serialization (2-3x faster than standard json)

## Dependencies

- Flask >= 2.3.0
- orjson >= 3.9.0
