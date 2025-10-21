# enrich_transects.py
import os, pandas as pd
from pyproj import Transformer

ART_DIR = "./artifacts"
inp = os.path.join(ART_DIR, "transects.csv")
out = os.path.join(ART_DIR, "transects_enriched.csv")

df = pd.read_csv(inp)
df["mid_x"] = (df["x1"] + df["x2"]) / 2.0
df["mid_y"] = (df["y1"] + df["y2"]) / 2.0

to4326 = Transformer.from_crs("EPSG:3857", "EPSG:4326", always_xy=True)
df["mid_lon"], df["mid_lat"] = to4326.transform(df["mid_x"].values, df["mid_y"].values)
df["lon1"], df["lat1"]       = to4326.transform(df["x1"].values,  df["y1"].values)
df["lon2"], df["lat2"]       = to4326.transform(df["x2"].values,  df["y2"].values)

df.to_csv(out, index=False)
print("Saved:", out)
