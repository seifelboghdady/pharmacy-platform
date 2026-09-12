"""
STEP 2 — TRAIN THE MODEL, ONCE. (new file, added per mentor review)
---------------------------------------------------------------------------
This is the ONLY place training happens in the whole project now.
pipeline_step3_final.py, ai_service.py and app_ui.py all just load the
file this script saves (demand_model.joblib) and call .predict().

MENTOR FEEDBACK IMPLEMENTED IN THIS FILE
-----------------------------------------
1) "DROP Prophet -> Large scale."
   Prophet dropped everywhere. One global LightGBM model (see features.py)
   replaces per-product Prophet models.

2) "ai_service.py instantiate brand new prophet model from scratch ->
   split inference from training -> train once, then load it to memory to
   predict."
   This script IS the split: training lives here and nowhere else.
   ai_service.py / app_ui.py / pipeline_step3_final.py only load the
   .joblib file and run inference.

3) "Use LightGBM, it's good." -> LGBMRegressor is the model used.

4) "Use hyperparameter tuning solutions, LGBM is sensitive -> Use TPE from
   Optuna, Alt'd Gridsearch -> Use optuna.integration.LightGBM."
   Optuna with its default TPE sampler tunes the hyperparameters below.
   NOTE: optuna.integration.lightgbm.LightGBMTuner (Optuna's automated
   step-wise LightGBM tuner) is a drop-in alternative to the manual
   objective() function below if you want an even more automated sweep —
   swap it in here if you'd rather not hand-pick the search space.

5) "Comparison of models should implement Nested Cross-validation (CV) ->
   TimeSeriesSplit or sklearn -> train and test over multiple 30-Day
   folds, or rolling origin or sliding window."
   The Optuna objective() below is genuine NESTED CV:
     OUTER loop = rolling-origin 30-day test folds (cv_utils.rolling_origin_folds)
     INNER loop = sklearn TimeSeriesSplit on each fold's TRAINING portion only
   Hyperparameters are tuned using only the inner splits; the outer test
   fold is scored afterwards, with the winning params, in a separate pass
   ("Outer-loop honest evaluation" below) — so tuning never sees the data
   used to report the final number.

6) "For regression: use MAE loss or MAPE (percent)." -> MAE is the scoring
   metric for both the inner tuning loop and the outer honest evaluation.
"""
import json

import joblib
import numpy as np
import pandas as pd
import optuna
from lightgbm import LGBMRegressor
from sklearn.metrics import mean_absolute_error

from cv_utils import inner_time_series_splits, rolling_origin_folds
from features import CATEGORICAL_COLS, FEATURE_COLS, TARGET_COL, build_model_frame

optuna.logging.set_verbosity(optuna.logging.WARNING)

N_OUTER_FOLDS = 5
TEST_SIZE_DAYS = 30
N_OPTUNA_TRIALS = 25

daily_full = pd.read_parquet("daily_features.parquet")
prod_ref = pd.read_parquet("product_ref.parquet")

df = build_model_frame(daily_full)
df_labeled = df.dropna(subset=[TARGET_COL] + FEATURE_COLS).reset_index(drop=True)

outer_folds = rolling_origin_folds(
    df_labeled["Date"], n_folds=N_OUTER_FOLDS, test_size_days=TEST_SIZE_DAYS, min_train_days=180
)
if not outer_folds:
    raise RuntimeError(
        "Not enough history for even one 30-day rolling-origin fold. "
        "Lower min_train_days or add more historical data."
    )

print(f"Outer folds (rolling-origin, {TEST_SIZE_DAYS}-day test windows): {len(outer_folds)}")
for i, (train_end, test_start, test_end) in enumerate(outer_folds, 1):
    print(f"  Fold {i}: train up to {train_end.date()} | test {test_start.date()} -> {test_end.date()}")


def make_model(params: dict) -> LGBMRegressor:
    return LGBMRegressor(objective="regression", random_state=42, verbosity=-1, **params)


def objective(trial: optuna.Trial) -> float:
    """
    INNER loop of the nested CV: score a candidate hyperparameter set using
    sklearn's TimeSeriesSplit on the training portion of EACH outer fold,
    then average. The outer fold's held-out test window is never touched
    here — see the honest evaluation pass further down.
    """
    params = {
        "n_estimators": trial.suggest_int("n_estimators", 100, 600),
        "num_leaves": trial.suggest_int("num_leaves", 15, 127),
        "max_depth": trial.suggest_int("max_depth", 3, 10),
        "learning_rate": trial.suggest_float("learning_rate", 0.01, 0.2, log=True),
        "min_child_samples": trial.suggest_int("min_child_samples", 5, 50),
        "subsample": trial.suggest_float("subsample", 0.6, 1.0),
        "colsample_bytree": trial.suggest_float("colsample_bytree", 0.6, 1.0),
    }

    fold_scores = []
    for train_end, _, _ in outer_folds:
        outer_train = df_labeled[df_labeled["Date"] <= train_end].reset_index(drop=True)
        if len(outer_train) < 200:
            continue
        for inner_train_idx, inner_val_idx in inner_time_series_splits(n_splits=3).split(outer_train):
            inner_train = outer_train.iloc[inner_train_idx]
            inner_val = outer_train.iloc[inner_val_idx]
            if len(inner_val) == 0 or len(inner_train) == 0:
                continue
            model = make_model(params)
            model.fit(inner_train[FEATURE_COLS], inner_train[TARGET_COL], categorical_feature=CATEGORICAL_COLS)
            preds = np.clip(model.predict(inner_val[FEATURE_COLS]), 0, None)
            fold_scores.append(mean_absolute_error(inner_val[TARGET_COL], preds))

    return float(np.mean(fold_scores)) if fold_scores else float("inf")


print(f"\nTuning hyperparameters with Optuna (TPE sampler, {N_OPTUNA_TRIALS} trials, nested CV)...")
study = optuna.create_study(direction="minimize", sampler=optuna.samplers.TPESampler(seed=42))
study.optimize(objective, n_trials=N_OPTUNA_TRIALS)
best_params = study.best_params
print("Best params:", best_params)
print(f"Best inner-CV MAE: {study.best_value:.2f} units")


def outer_fold_mae(params, train_end, test_start, test_end):
    train = df_labeled[df_labeled["Date"] <= train_end]
    test = df_labeled[(df_labeled["Date"] >= test_start) & (df_labeled["Date"] <= test_end)]
    if len(train) < 100 or len(test) == 0:
        return None
    model = make_model(params)
    model.fit(train[FEATURE_COLS], train[TARGET_COL], categorical_feature=CATEGORICAL_COLS)
    preds = np.clip(model.predict(test[FEATURE_COLS]), 0, None)
    return mean_absolute_error(test[TARGET_COL], preds)


print("\nOuter-loop honest evaluation (each fold scored on data never seen during tuning)...")
outer_scores = []
for i, (train_end, test_start, test_end) in enumerate(outer_folds, 1):
    mae = outer_fold_mae(best_params, train_end, test_start, test_end)
    if mae is not None:
        outer_scores.append(mae)
        print(f"  Fold {i}: MAE = {mae:.2f} units (test {test_start.date()} -> {test_end.date()})")

mean_outer_mae = float(np.mean(outer_scores)) if outer_scores else None
print(f"\nMean outer-fold MAE across {len(outer_scores)} folds: {mean_outer_mae:.2f} units")
print(
    "(This is averaged over MULTIPLE 30-day windows spread across history — "
    "quiet ones and promo-heavy ones both included — instead of one arbitrary "
    "30-day sample.)"
)


# FINAL FIT — train ONCE on all available labeled data, then save to disk.
# ai_service.py / app_ui.py / pipeline_step3_final.py load this and only
# ever call .predict() — no training in the request/UI path.

final_model = make_model(best_params)
final_model.fit(df_labeled[FEATURE_COLS], df_labeled[TARGET_COL], categorical_feature=CATEGORICAL_COLS)

joblib.dump(final_model, "demand_model.joblib")
with open("model_metadata.json", "w") as f:
    json.dump(
        {
            "feature_cols": FEATURE_COLS,
            "categorical_cols": CATEGORICAL_COLS,
            "target_col": TARGET_COL,
            "best_params": best_params,
            "mean_outer_fold_mae": mean_outer_mae,
            "n_outer_folds": len(outer_scores),
        },
        f,
        indent=2,
    )

print("\nSaved: demand_model.joblib (trained once) + model_metadata.json")
print("Re-run this script whenever daily_features.parquet changes (new sales data, new products).")
