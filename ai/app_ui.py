"""
LOCAL TEST UI — Streamlit app to try the pre-trained model interactively
--------------------------------------------------------------------------
MENTOR FEEDBACK IMPLEMENTED: no training happens when you click Predict.
Run `python train_models.py` once beforehand (or after any data update);
this UI loads that saved model + does inference only, same as ai_service.py.

Run:
    python train_models.py
    streamlit run app_ui.py
"""
import json

import joblib
import numpy as np
import pandas as pd
import streamlit as st

from features import FEATURE_COLS, build_model_frame

st.set_page_config(page_title="Pharmacy AI Model — Local Test", layout="centered")
st.title("🏥 Pharmacy Demand & Risk Model — Test UI")
st.caption("Local testing interface for the ML model (not the final product UI).")


@st.cache_resource
def load_model():
    model = joblib.load("demand_model.joblib")
    with open("model_metadata.json") as f:
        meta = json.load(f)
    return model, meta


@st.cache_data
def load_data():
    daily = pd.read_parquet("daily_features.parquet")
    prod = pd.read_parquet("product_ref.parquet")
    model_frame = build_model_frame(daily)
    latest = model_frame.sort_values("Date").groupby("ProductID").tail(1).set_index("ProductID")
    return daily, prod, latest


model, meta = load_model()
daily_full, prod_ref, latest_by_product = load_data()

if meta.get("mean_outer_fold_mae") is not None:
    st.info(
        f"Model accuracy (mean MAE across {meta['n_outer_folds']} rolling 30-day "
        f"test folds, nested CV): **{meta['mean_outer_fold_mae']:.1f} units**. "
        f"LightGBM, hyperparameters tuned with Optuna.",
        icon="📊",
    )

SHELF_LIFE_BY_CATEGORY = {
    "OTC": 730, "Personal Care": 1095, "Prescription": 540,
    "Wellness": 730, "Medical Devices": 1825,
}

active = prod_ref[prod_ref["IsDiscontinued"] == "No"]
categories = ["All"] + sorted(active["Category"].unique().tolist())

st.subheader("Options")
category_filter = st.selectbox("Filter by category", categories)
st.caption(
    "Forecast horizon is fixed at 30 days — the model predicts the 30-day total "
    "directly (not a per-week recursive forecast)."
)

filtered = active if category_filter == "All" else active[active["Category"] == category_filter]
product_options = dict(zip(filtered["ProductName"] + " (" + filtered["ProductID"] + ")", filtered["ProductID"]))

col1, col2 = st.columns(2)
with col1:
    selected_label = st.selectbox("Choose a product", list(product_options.keys()))
    product_id = product_options[selected_label]
with col2:
    category = active[active["ProductID"] == product_id]["Category"].values[0]
    st.text_input("Category", value=category, disabled=True)

col3, col4 = st.columns(2)
with col3:
    current_stock = st.number_input(
        "Current stock (units) — ⚠ in production this MUST come from the mobile "
        "app's real, live inventory capture, not a manual guess",
        min_value=0, value=100, step=1,
    )
with col4:
    promo_planned = st.checkbox("📢 Planning a promotion in this period?", value=False)

safety_days = st.slider("Safety stock buffer (days)", min_value=0, max_value=21, value=7)

if st.button("🔮 Predict", type="primary"):
    if product_id not in latest_by_product.index:
        st.error("No feature history available for this product.")
    else:
        row = latest_by_product.loc[[product_id]].copy()
        row["PromoActive"] = 1 if promo_planned else 0
        predicted = float(np.clip(model.predict(row[FEATURE_COLS])[0], 0, None))

        df_hist = daily_full[daily_full["ProductID"] == product_id]
        recent_avg = df_hist["UnitsSold"].tail(30).mean()
        safety_stock = recent_avg * safety_days
        reorder_qty = max(0, predicted + safety_stock - current_stock)

        shelf_life = SHELF_LIFE_BY_CATEGORY.get(category, 730)
        expected_sell_days = current_stock / max(recent_avg, 0.01)
        expiry_score = min(100, (expected_sell_days / shelf_life) * 100)
        risk_level = "High" if expiry_score >= 70 else "Medium" if expiry_score >= 40 else "Low"

        st.subheader("Results")
        c1, c2, c3 = st.columns(3)
        c1.metric("Predicted sales (next 30 days)", f"{predicted:.0f} units")
        c2.metric("Suggested reorder quantity", f"{reorder_qty:.0f} units")
        risk_color = {"Low": "🟢", "Medium": "🟡", "High": "🔴"}[risk_level]
        c3.metric("Expiry risk", f"{risk_color} {risk_level}", f"{expiry_score:.1f}/100")

        if promo_planned:
            st.caption("📢 Forecast includes the promo effect the model learned from historical PromoActive data.")

        st.subheader("Recent sales history")
        hist_weekly = df_hist.set_index("Date")["UnitsSold"].resample("W").sum()
        st.line_chart(hist_weekly.tail(26))
