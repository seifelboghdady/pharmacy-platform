"""
MODEL COMPARISON — Naive baseline vs LightGBM, over MULTIPLE rolling folds
----------------------------------------------------------------------------
MENTOR FEEDBACK IMPLEMENTED
----------------------------
- Prophet dropped (see features.py / train_models.py header for why).
- No more single 2-way train/test split. This comparison runs over
  MULTIPLE 30-day rolling-origin folds (cv_utils.rolling_origin_folds),
  i.e. "train and test over multiple 30-Day folds, rolling origin or
  sliding window" — so the winner isn't decided by one arbitrary 30-day
  sample that might be unusually quiet or promo-heavy.
- Metric: MAE (mentor: "for regression use MAE loss or MAPE").
"""
import warnings

import numpy as np
import pandas as pd
from lightgbm import LGBMRegressor
from sklearn.metrics import mean_absolute_error

from cv_utils import rolling_origin_folds
from features import CATEGORICAL_COLS, FEATURE_COLS, TARGET_COL, build_model_frame

warnings.filterwarnings("ignore")

daily_full = pd.read_parquet("daily_features.parquet")
prod_ref = pd.read_parquet("product_ref.parquet")

df = build_model_frame(daily_full)
df_labeled = df.dropna(subset=[TARGET_COL] + FEATURE_COLS).reset_index(drop=True)

N_FOLDS = 5
folds = rolling_origin_folds(df_labeled["Date"], n_folds=N_FOLDS, test_size_days=30, min_train_days=180)
print(f"Comparing over {len(folds)} rolling-origin 30-day folds (not a single split).\n")


def naive_baseline_mae(test: pd.DataFrame) -> float:
    """Naive: predict next 30 days = this product's own trailing 30-day total."""
    preds = test["sales_last_30_days"].fillna(0).clip(lower=0)
    return mean_absolute_error(test[TARGET_COL], preds)


def lightgbm_mae(train: pd.DataFrame, test: pd.DataFrame) -> float:
    model = LGBMRegressor(
        n_estimators=300, max_depth=6, num_leaves=31,
        learning_rate=0.05, random_state=42, verbosity=-1,
    )
    model.fit(train[FEATURE_COLS], train[TARGET_COL], categorical_feature=CATEGORICAL_COLS)
    preds = np.clip(model.predict(test[FEATURE_COLS]), 0, None)
    return mean_absolute_error(test[TARGET_COL], preds)


naive_scores, lgbm_scores = [], []
for i, (train_end, test_start, test_end) in enumerate(folds, 1):
    train = df_labeled[df_labeled["Date"] <= train_end]
    test = df_labeled[(df_labeled["Date"] >= test_start) & (df_labeled["Date"] <= test_end)]
    if len(train) < 200 or len(test) == 0:
        continue

    n_mae = naive_baseline_mae(test)
    l_mae = lightgbm_mae(train, test)
    naive_scores.append(n_mae)
    lgbm_scores.append(l_mae)
    print(
        f"Fold {i} ({test_start.date()} -> {test_end.date()}): "
        f"naive MAE={n_mae:.1f} | LightGBM MAE={l_mae:.1f}"
    )

print(f"\nMean over {len(lgbm_scores)} folds — Naive baseline: {np.mean(naive_scores):.1f} units")
print(f"Mean over {len(lgbm_scores)} folds — LightGBM:        {np.mean(lgbm_scores):.1f} units")

winner = "LightGBM" if np.mean(lgbm_scores) < np.mean(naive_scores) else "Naive baseline"
print(f"\n>>> Better model across all {len(lgbm_scores)} folds: {winner}")
print(
    "(For a real hyperparameter search on top of this, see train_models.py, "
    "which nests an Optuna/TPE search inside each outer fold's training "
    "portion via sklearn's TimeSeriesSplit.)"
)
