import os
import pandas as pd

BASE = os.path.dirname(os.path.abspath(__file__))
path = os.path.join(BASE, "artifacts", "shoreline_positions_annual.csv")

df = pd.read_csv(path)

# % valid positions per year
by_year = df.groupby("year")["position_m"].apply(lambda s: s.notna().mean()).rename("valid_frac").round(3)
print("Valid fraction by year:")
print(by_year.to_string())

# % valid positions per transect (and summary stats)
by_tr = df.groupby("transect_id")["position_m"].apply(lambda s: s.notna().mean()).rename("valid_frac").round(3)
print("\nValid fraction by transect (summary):")
print(by_tr.describe().round(3).to_string())

# save to CSVs for inspection
out_dir = os.path.join(BASE, "artifacts")
by_year.to_csv(os.path.join(out_dir, "validity_by_year.csv"), header=True)
by_tr.to_csv(os.path.join(out_dir, "validity_by_transect.csv"), header=True)
print("\nSaved: artifacts/validity_by_year.csv and artifacts/validity_by_transect.csv")
