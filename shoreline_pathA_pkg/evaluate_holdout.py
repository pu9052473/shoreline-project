# evaluate_holdout.py
import os, json, numpy as np, pandas as pd, joblib
from sklearn.metrics import mean_absolute_error

from config import NDWI_DIR, WAVES_CSV, RAIN_CSV
from train_model import build_labels, load_hourly_drivers, annual_features, build_training

ART_DIR = "./artifacts"
os.makedirs(ART_DIR, exist_ok=True)

OUT_CSV  = os.path.join(ART_DIR, "holdout_predictions_2020_2025.csv")
OUT_JSON = os.path.join(ART_DIR, "holdout_metrics_2020_2025.json")

def main():
    # Load model + meta
    model = joblib.load(os.path.join(ART_DIR, "model_ridge.pkl"))
    meta  = json.load(open(os.path.join(ART_DIR, "model_features.json"), "r"))
    feats_used = meta["features"]

    # Rebuild labels/features from your data
    labels, _ = build_labels(NDWI_DIR)
    hourly = load_hourly_drivers(WAVES_CSV, RAIN_CSV)
    feats  = annual_features(hourly)

    # Build holdout: 2020–2025 (Sentinel-2 period)
    hold = build_training(labels, feats, y0=2020, y1=2025)
    if hold.empty:
        print("No holdout samples found (2020–2025). Check NDWI & ERA5 coverage.")
        return

    X = hold[feats_used].values
    y = hold["delta_pos_m"].values
    yhat = model.predict(X)

    # Metrics
    mae_overall = mean_absolute_error(y, yhat)
    by_year = (
        pd.DataFrame({"year": hold["year"].values, "err": np.abs(y - yhat)})
        .groupby("year")["err"].mean().round(2)
    )
    by_transect = (
        pd.DataFrame({"transect_id": hold["transect_id"].values, "err": np.abs(y - yhat)})
        .groupby("transect_id")["err"].mean().sort_values(ascending=False)
    )

    # Save detailed predictions
    pred_df = hold[["transect_id","year","delta_pos_m"]].copy()
    pred_df = pred_df.rename(columns={"delta_pos_m":"delta_true_m"})
    pred_df["delta_pred_m"] = yhat
    pred_df["abs_err_m"] = np.abs(pred_df["delta_true_m"] - pred_df["delta_pred_m"])
    pred_df.to_csv(OUT_CSV, index=False)

    # Save summary metrics
    summary = {
        "holdout_years": [int(hold["year"].min()), int(hold["year"].max())],
        "n_samples": int(len(hold)),
        "mae_overall_m": float(round(mae_overall, 2)),
        "mae_by_year_m": {int(k): float(v) for k, v in by_year.to_dict().items()},
        "worst_10_transects_by_mae": [int(t) for t in by_transect.head(10).index.tolist()],
    }
    with open(OUT_JSON, "w") as f:
        json.dump(summary, f, indent=2)

    # Print a concise report
    print(f"Holdout MAE 2020–2025: {mae_overall:.2f} m on {len(hold)} samples")
    print("MAE by year (m):")
    print(by_year.to_string())
    print(f"\nSaved predictions: {OUT_CSV}")
    print(f"Saved metrics:     {OUT_JSON}")

if __name__ == "__main__":
    main()
