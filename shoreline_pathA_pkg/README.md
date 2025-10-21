
# Frankston Shoreline — Path A Package (Train 2000–2019; Holdout 2020–2025)

This package is ready to train a baseline shoreline-change model and serve 7‑day forecasts via a web API.

**Approach (Path A):**
- Train on **Landsat years 2000–2019** (annual NDWI-derived shoreline positions)
- Hold out **Sentinel‑2 years 2020–2025** (for domain-shift testing later)
- Drivers engineered from **ERA5** hourly waves/precip (your CSVs)
- 7‑day forecast built from **OpenWeatherMap** (wind/rain proxy)

## 1) Install
```bash
pip install -r requirements.txt
```
> If Rasterio fails on Windows, install GDAL first (conda recommended) or use WSL.

## 2) Configure paths & keys
Edit `config.py` — set:
- `NDWI_DIR` to your per‑year NDWI GeoTIFF folder
- `WAVES_CSV` and `RAIN_CSV` to your ERA5 CSVs
- `OWM_API_KEY` to your OpenWeatherMap key

## 3) Train (produces ./artifacts/)
```bash
python train_model.py
# or: bash scripts/run_train.sh
```
Artifacts saved to `./artifacts/`:
- `model_ridge.pkl` (trained baseline)
- `model_features.json` (feature names & training years)
- `transects.csv` (transects used)
- `shoreline_positions_annual.csv` (labels)
- `annual_driver_features.csv` (ERA5-derived features)
- `typical_annual_delta_by_transect.csv` (context)

## 4) Serve API (uses artifacts/)
```bash
export OWM_API_KEY=YOUR_KEY   # or set in config.py
uvicorn serve_api:app --host 0.0.0.0 --port 8000
# or: bash scripts/run_api.sh
```
POST `http://localhost:8000/forecast-7d` with body:
```json
{"lat": -38.5, "lon": 145.0}
```
Returns JSON list for next 7 days × transects with `pred_daily_delta_m` and met fields.

## Notes
- This is a baseline suited to your current **annual** label grain. For higher skill, add a proper **wave forecast** (Hs/Tp/Dir) and/or **daily shoreline** labels, then upgrade the model.
- NDAWI outliers in 2020/2025 are handled by clipping to [-1,1] during shoreline extraction.
