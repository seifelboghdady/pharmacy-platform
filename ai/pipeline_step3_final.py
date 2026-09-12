"""
STEP 3 — FINAL REPORT: Demand Forecast -> Reorder Suggestion -> Risk Score
--------------------------------------------------------------------------
Run AFTER train_models.py. This file does NOT train anything anymore — it
loads demand_model.joblib (trained ONCE by train_models.py) and calls
.predict() for every active product. See train_models.py's docstring for
the full list of mentor feedback that drove this split.

⚠ STOCK_QUANTITY / EXPIRY DATE ARE STILL SIMULATED — SEE WARNING BELOW.
This is a separate, non-code issue flagged by the mentor:
  "How is the mobile app gonna capture stock_quantity? If not, AI is doing
  nothing."
No matter how accurate the demand forecast is, `reorder_quantity` and
`risk_level` below are only meaningful once a real Stock_Quantity value is
captured live (e.g. by the mobile app scanning/updating inventory) and fed
in instead of the SIMULATED_current_stock placeholder computed here. This
is a product/data-pipeline requirement for the team, not something a model
change can fix — flagging it prominently so it isn't lost.
"""
import json

import joblib
import numpy as np
import pandas as pd

from features import FEATURE_COLS, build_model_frame

daily_full = pd.read_parquet("daily_features.parquet")
prod_ref = pd.read_parquet("product_ref.parquet")

model = joblib.load("demand_model.joblib")
with open("model_metadata.json") as f:
    meta = json.load(f)

df = build_model_frame(daily_full)

# Most recent row per product = the feature snapshot we forecast the NEXT
# 30 days FROM. Inference only — the model itself was trained once, offline,
# by train_models.py.
latest = df.sort_values("Date").groupby("ProductID", as_index=False).tail(1).copy()

active_ids = prod_ref[prod_ref["IsDiscontinued"] == "No"]["ProductID"]
latest = latest[latest["ProductID"].isin(active_ids)].copy()

latest["predicted_units_next_30_days"] = np.clip(model.predict(latest[FEATURE_COLS]), 0, None).round(1)
latest["avg_daily_forecast"] = (latest["predicted_units_next_30_days"] / 30).round(2)

fc = latest.merge(
    prod_ref[["ProductID", "ProductName", "Category"]].drop_duplicates(),
    on="ProductID", how="left", suffixes=("", "_ref"),
)
fc["Category"] = fc["Category"].astype(object)
fc["Category"] = fc["Category"].where(fc["Category"].notna(), fc.get("Category_ref"))


# SIMULATED CURRENT STOCK  (⚠ still a placeholder — see module docstring)
# Assumption: pharmacy currently holds ~20 days of recent average sales.

recent_avg = (
    daily_full[daily_full["Date"] >= daily_full["Date"].max() - pd.Timedelta(days=30)]
    .groupby("ProductID")["UnitsSold"].mean()
    .rename("recent_avg_daily_sales")
)
fc = fc.merge(recent_avg, on="ProductID", how="left")
fc["SIMULATED_current_stock"] = (fc["recent_avg_daily_sales"] * 20).round().clip(lower=1)


# REORDER QUANTITY SUGGESTION

SAFETY_STOCK_DAYS = 7
fc["safety_stock"] = (fc["recent_avg_daily_sales"] * SAFETY_STOCK_DAYS).round()
fc["reorder_quantity"] = (
    fc["predicted_units_next_30_days"] + fc["safety_stock"] - fc["SIMULATED_current_stock"]
).clip(lower=0).round()


# SIMULATED EXPIRY RISK (⚠ category-based shelf life assumption, not real data)

shelf_life_by_category = {
    "OTC": 730, "Personal Care": 1095, "Prescription": 540,
    "Wellness": 730, "Medical Devices": 1825,
}
fc["SIMULATED_shelf_life_days"] = fc["Category"].map(shelf_life_by_category)
fc["expected_sell_days"] = fc["SIMULATED_current_stock"] / fc["recent_avg_daily_sales"].replace(0, 0.01)
fc["expiry_score"] = (fc["expected_sell_days"] / fc["SIMULATED_shelf_life_days"]).clip(upper=1) * 100
fc["risk_level"] = pd.cut(fc["expiry_score"], bins=[-1, 40, 70, 101], labels=["Low", "Medium", "High"])


# FINAL OUTPUT

final = fc[[
    "ProductID", "ProductName", "Category",
    "predicted_units_next_30_days", "SIMULATED_current_stock",
    "reorder_quantity", "expiry_score", "risk_level",
]].sort_values("predicted_units_next_30_days", ascending=False)

pd.set_option("display.width", 160)
print(final.head(15).to_string(index=False))
final.to_csv("final_model_output.csv", index=False)
print(f"\nTotal products forecasted: {len(final)}")
print("Saved: final_model_output.csv")

if meta.get("mean_outer_fold_mae") is not None:
    print(
        f"\nModel: LightGBM (global, Optuna-tuned), evaluated with nested CV over "
        f"{meta['n_outer_folds']} rolling 30-day folds -> mean MAE = "
        f"{meta['mean_outer_fold_mae']:.1f} units/30-days."
    )

print(
    "\n⚠ Reminder: reorder_quantity and risk_level above use a SIMULATED current "
    "stock value. Replace SIMULATED_current_stock with a real, mobile-app-captured "
    "Stock_Quantity feed before trusting these numbers in production."
)
