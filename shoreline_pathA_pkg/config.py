# config.py
import os

# --- base folder on your machine ---
BASE_DIR = r"C:\Users\draza\Downloads\shoreline_pathA_pkg"

# --- data locations ---
# NDWI_DIR is a FOLDER (even though its name ends with .tif)
NDWI_DIR  = os.path.join(BASE_DIR, "Frankston_1972-2025_NDWI.tif")
WAVES_CSV = os.path.join(BASE_DIR, "reanalysis-era5-single-levels-timeseries-wavb9i2_heu.csv")
RAIN_CSV  = os.path.join(BASE_DIR, "reanalysis-era5-single-levels-timeseries-sfcsx2pnsdy.csv")

# --- Path A (training years) ---
TRAIN_YEAR_START = 2000
TRAIN_YEAR_END   = 2019
HOLDOUT_YEAR_END = 2025   # informational

# --- OpenWeatherMap ---
OWM_API_KEY   = "2e35215200e4db9d6aa4fc67471fd279"  # or set env var OWM_API_KEY
OWM_ENDPOINT  = "https://api.openweathermap.org/data/3.0/onecall"
OWM_WIND_STORM_THRES = 10.0  # m/s threshold for storm proxy

# --- timezone & forecast horizon ---
TZ = "Australia/Melbourne"
FORECAST_DAYS = 7

# --- NDWI handling (improves shoreline extraction) ---
# Use adaptive thresholding and auto-rescale per image.
# If your validity is still low, you can later try NDWI_WATER_HIGH = False.
NDWI_THRESHOLD      = "auto"   # "auto" or a float like -0.10
NDWI_AUTO_RESCALE   = True     # rescale to 0..1 if range looks like 0..255 etc.
NDWI_WATER_HIGH     = True     # True: water >= threshold; False: water <= threshold

# --- transects (denser & longer = more reliable intersections) ---
TRANSECT_SPACING_M = 50.0      # was 100.0
TRANSECT_LENGTH_M  = 600.0     # was 400.0 (half-length per side)

# --- model ---
RIDGE_ALPHA = 1.0
