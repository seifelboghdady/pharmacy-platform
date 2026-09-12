"""
ACCURACY EVALUATION
----------------------------------------------------------------------------
Two things are evaluated here, scored with two DIFFERENT metric families
per mentor's note ("For regression: use MAE loss or MAPE (percent). For
classification: use Precision, Recall, F1, Specificity, ROC curve."):

  PART 1 — the demand FORECAST (a regression problem): with vs without the
           PromoActive feature, scored with MAE and MAPE-derived accuracy.
  PART 2 — the derived risk_level LABEL (a classification problem, Low /
           Medium / High): scored with Precision, Recall, F1, a confusion
           matrix, per-class Specificity, and a ROC AUC for the binary
           "High risk vs not" split.

Both parts run over MULTIPLE rolling-origin 30-day folds (cv_utils), not a
single train/test split — same rationale as model_comparison.py and
train_models.py: one 30-day sample could be unusually quiet or
promo-heavy, so we average across several different windows in history.
"""
import warnings

import numpy as np
import pandas as pd
from lightgbm import LGBMRegressor
from sklearn.metrics import classification_report, confusion_matrix, mean_absolute_error, roc_auc_score

from cv_utils import rolling_origin_folds
from features import CATEGORICAL_COLS, FEATURE_COLS, TARGET_COL, build_model_frame

warnings.filterwarnings("ignore")

daily_full = pd.read_parquet("daily_features.parquet")
prod_ref = pd.read_parquet("product_ref.parquet")

df = build_model_frame(daily_full)
df_labeled = df.dropna(subset=[TARGET_COL] + FEATURE_COLS).reset_index(drop=True)

N_FOLDS = 5
folds = rolling_origin_folds(df_labeled["Date"], n_folds=N_FOLDS, test_size_days=30, min_train_days=180)
FEATURES_NO_PROMO = [c for c in FEATURE_COLS if c != "PromoActive"]

SHELF_LIFE_BY_CATEGORY = {
    "OTC": 730, "Personal Care": 1095, "Prescription": 540,
    "Wellness": 730, "Medical Devices": 1825,
}


def fit_predict(features, train, test):
    model = LGBMRegressor(
        n_estimators=300, max_depth=6, num_leaves=31,
        learning_rate=0.05, random_state=42, verbosity=-1,
    )
    model.fit(train[features], train[TARGET_COL], categorical_feature=CATEGORICAL_COLS)
    return np.clip(model.predict(test[features]), 0, None)


# ============================================================
# PART 1 — REGRESSION METRICS (MAE / MAPE) — with vs without PromoActive
# ============================================================
print("=" * 70)
print("PART 1 — Demand forecast (regression): MAE + MAPE, with vs without PromoActive")
print("=" * 70)

mae_no_promo, mae_promo, mape_no_promo, mape_promo = [], [], [], []
for i, (train_end, test_start, test_end) in enumerate(folds, 1):
    train = df_labeled[df_labeled["Date"] <= train_end]
    test = df_labeled[(df_labeled["Date"] >= test_start) & (df_labeled["Date"] <= test_end)]
    if len(train) < 200 or len(test) == 0:
        continue

    preds_no_promo = fit_predict(FEATURES_NO_PROMO, train, test)
    preds_promo = fit_predict(FEATURE_COLS, train, test)

    mask = test[TARGET_COL] > 0  # MAPE undefined at 0 actual demand
    actual = test.loc[mask, TARGET_COL].to_numpy()

    m1 = mean_absolute_error(test[TARGET_COL], preds_no_promo)
    m2 = mean_absolute_error(test[TARGET_COL], preds_promo)
    p1 = np.mean(np.abs(preds_no_promo[mask.to_numpy()] - actual) / actual) * 100
    p2 = np.mean(np.abs(preds_promo[mask.to_numpy()] - actual) / actual) * 100

    mae_no_promo.append(m1); mae_promo.append(m2)
    mape_no_promo.append(p1); mape_promo.append(p2)
    print(
        f"Fold {i} ({test_start.date()} -> {test_end.date()}): "
        f"without promo MAE={m1:.1f}/MAPE={p1:.1f}% | with promo MAE={m2:.1f}/MAPE={p2:.1f}%"
    )

print(f"\nAveraged over {len(mae_promo)} rolling 30-day folds:")
print(
    f"WITHOUT PromoActive — MAE: {np.mean(mae_no_promo):.1f} units | "
    f"MAPE: {np.mean(mape_no_promo):.1f}% -> Accuracy: {100 - np.mean(mape_no_promo):.1f}%"
)
print(
    f"WITH    PromoActive — MAE: {np.mean(mae_promo):.1f} units | "
    f"MAPE: {np.mean(mape_promo):.1f}% -> Accuracy: {100 - np.mean(mape_promo):.1f}%"
)
print(
    f"\nImprovement from adding PromoActive: "
    f"{np.mean(mape_no_promo) - np.mean(mape_promo):+.1f} percentage points of MAPE "
    f"(averaged across {len(mae_promo)} different 30-day windows, not a single one)."
)

# ============================================================
# PART 2 — CLASSIFICATION METRICS — risk_level (Low / Medium / High)
# ============================================================
# risk_level is a categorical output, so it's scored with classification
# metrics (Precision/Recall/F1/Specificity/ROC), not MAE/MAPE. We compare
# the risk_level computed from the model's FORECAST ("predicted") against
# the risk_level computed from what ACTUALLY happened in that fold's test
# window ("actual"), using each row's own trailing sales as the stock proxy
# (there is no real Stock_Quantity yet — see the mobile-app note elsewhere
# in this project).
print("\n" + "=" * 70)
print("PART 2 — Risk-level (Low/Medium/High): Precision, Recall, F1, Specificity, ROC AUC")
print("=" * 70)


def to_risk_level(expected_sell_days, shelf_life_days):
    score = np.clip(expected_sell_days / shelf_life_days, 0, 1) * 100
    labels = pd.cut(score, bins=[-1, 40, 70, 101], labels=["Low", "Medium", "High"])
    return labels, score


y_true_all, y_pred_all, high_true_all, high_score_all = [], [], [], []
for train_end, test_start, test_end in folds:
    train = df_labeled[df_labeled["Date"] <= train_end]
    test = df_labeled[(df_labeled["Date"] >= test_start) & (df_labeled["Date"] <= test_end)].copy()
    if len(train) < 200 or len(test) == 0:
        continue

    test["predicted_30d"] = np.clip(fit_predict(FEATURE_COLS, train, test), 0.01, None)
    shelf_life = test["Category"].astype(str).map(SHELF_LIFE_BY_CATEGORY).fillna(730)

    # stock proxy for this offline test: the trailing 30-day sales level
    stock_proxy = test["sales_last_30_days"].fillna(1).clip(lower=1)
    pred_sell_days = stock_proxy / (test["predicted_30d"] / 30)
    true_sell_days = stock_proxy / (test[TARGET_COL].clip(lower=0.01) / 30)

    pred_risk, pred_score = to_risk_level(pred_sell_days, shelf_life)
    true_risk, _ = to_risk_level(true_sell_days, shelf_life)

    y_true_all.extend(true_risk.tolist())
    y_pred_all.extend(pred_risk.tolist())
    high_true_all.extend((true_risk == "High").astype(int).tolist())
    high_score_all.extend(pred_score.tolist())

print(classification_report(y_true_all, y_pred_all, labels=["Low", "Medium", "High"], zero_division=0))

cm = confusion_matrix(y_true_all, y_pred_all, labels=["Low", "Medium", "High"])
print("Confusion matrix (rows=actual, cols=predicted), order [Low, Medium, High]:")
print(cm)

print("\nSpecificity per class (TN / (TN + FP), one-vs-rest):")
for idx, cls in enumerate(["Low", "Medium", "High"]):
    tn = cm.sum() - cm[idx, :].sum() - cm[:, idx].sum() + cm[idx, idx]
    fp = cm[:, idx].sum() - cm[idx, idx]
    specificity = tn / (tn + fp) if (tn + fp) > 0 else float("nan")
    print(f"  {cls} vs rest: {specificity:.3f}")

if len(set(high_true_all)) > 1:
    auc = roc_auc_score(high_true_all, high_score_all)
    print(f"\nROC AUC (binary: High-risk vs not, ranked by expiry_score): {auc:.3f}")
else:
    print("\nROC AUC skipped: this sample only contains one class of 'High risk' actuals.")
