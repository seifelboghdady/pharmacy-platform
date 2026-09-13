"""
Shared feature construction for the ONE global LightGBM demand model.

MENTOR FEEDBACK THIS FILE IMPLEMENTS
-------------------------------------
"DROP Prophet -> Large scale."

  The old pipeline fit a SEPARATE Prophet model per product, from scratch,
  every time (in the batch report, in the API, in the UI). That does not
  scale: 220 products x weekly refits x every request. Prophet is a good
  tool but not for this "large scale, many products, refit constantly"
  shape of problem.

  Replacement: ONE global LightGBM model trained across ALL products at
  once, using ProductID and Category as categorical features (LightGBM
  handles these natively) plus the lag/calendar features already produced
  by pipeline_step1_clean_features.py. One model, trained once, scales to
  as many products as you add — see train_models.py.

This module is imported by train_models.py, pipeline_step3_final.py,
model_comparison.py, evaluate_accuracy.py, ai_service.py and app_ui.py so
every one of them builds features the exact same way.
"""
import numpy as np
import pandas as pd

FEATURE_COLS = [
    "day_of_week", "month", "is_holiday",
    "sales_last_7_days", "sales_last_30_days", "rolling_avg_14_days",
    "PromoActive", "ProductID", "Category",
]
CATEGORICAL_COLS = ["ProductID", "Category"]
TARGET_COL = "sales_next_30_days"


def _next_n_days_sum(units: pd.Series, n_days: int = 30) -> pd.Series:
    """
    target[t] = sum(units[t+1 .. t+n_days])  (NaN when there aren't
    `n_days` of future rows left, e.g. near the end of history).
    """
    values = units.to_numpy(dtype=float)
    n = len(values)
    cumsum = np.concatenate([[0.0], np.cumsum(values)])
    out = np.full(n, np.nan)
    last_valid = n - n_days
    if last_valid > 0:
        out[:last_valid] = cumsum[1 + n_days: n + 1] - cumsum[1:last_valid + 1]
    return pd.Series(out, index=units.index)


def add_target(daily_full: pd.DataFrame, n_days: int = 30) -> pd.DataFrame:
    """Add the forward-looking next-`n_days` sum as the regression target."""
    df = daily_full.sort_values(["ProductID", "Date"]).copy()
    df[TARGET_COL] = df.groupby("ProductID")["UnitsSold"].transform(
        lambda s: _next_n_days_sum(s, n_days)
    )
    return df


def build_model_frame(daily_full: pd.DataFrame) -> pd.DataFrame:
    """
    Attach the regression target and cast categorical columns so LightGBM
    can consume ProductID / Category natively (no manual one-hot needed).
    """
    df = add_target(daily_full)
    for col in CATEGORICAL_COLS:
        df[col] = df[col].astype("category")
    return df
