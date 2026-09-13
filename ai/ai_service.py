"""
AI SERVICE — FastAPI + MongoDB + Pre-trained LightGBM
"""

import json
import joblib
import numpy as np
import pandas as pd

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from database import (
    get_medicine_by_barcode,
    get_daily_sales_by_barcode,
)

from features import FEATURE_COLS, build_model_frame


app = FastAPI(title="Pharmacy AI Service")


# ============================================================
# Load ML model ONCE
# ============================================================

daily_full = pd.read_parquet("daily_features.parquet")

_model_frame = build_model_frame(daily_full)

_latest_by_product = (
    _model_frame
    .sort_values("Date")
    .groupby("ProductID")
    .tail(1)
    .set_index("ProductID")
)

MODEL = joblib.load("demand_model.joblib")

with open("model_metadata.json") as f:
    MODEL_META = json.load(f)


# ============================================================
# Configuration
# ============================================================

SHELF_LIFE_BY_CATEGORY = {
    "OTC": 730,
    "Personal Care": 1095,
    "Prescription": 540,
    "Wellness": 730,
    "Medical Devices": 1825,
}


# ============================================================
# Request / Response
# ============================================================

class PredictRequest(BaseModel):
    barcode: str
    promo_planned: bool = False


class PredictResponse(BaseModel):
    barcode: str
    medicine_name: str
    current_stock: float
    predicted_units_next_30_days: float
    reorder_quantity: float
    expiry_score: float
    risk_level: str


# ============================================================
# Health Check
# ============================================================

@app.get("/")
def health_check():

    return {
        "status": "AI Service is running",
        "model": "LightGBM",
        "database": "MongoDB Atlas",
        "mean_outer_fold_mae": MODEL_META.get("mean_outer_fold_mae"),
        "n_outer_folds": MODEL_META.get("n_outer_folds"),
    }


# ============================================================
# Prediction
# ============================================================

@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):

    
    # 1. Get medicine from MongoDB using barcode
    

    medicine = get_medicine_by_barcode(req.barcode)

    if not medicine:
        raise HTTPException(
            status_code=404,
            detail="Medicine not found for this barcode"
        )

    current_stock = float(medicine["stockQuantity"])
    category = medicine.get("category", "OTC")


    
    # 2. Get sales history from MongoDB
    

    daily_sales = get_daily_sales_by_barcode(req.barcode)

    if daily_sales.empty:
        raise HTTPException(
            status_code=400,
            detail="No sales history available for this medicine"
        )


    
    # 3. Build recent-sales statistics
    

    recent_avg = daily_sales["UnitsSold"].tail(30).mean()

    if pd.isna(recent_avg) or recent_avg <= 0:
        recent_avg = 1.0


    
    # 4. Temporary ProductID
    #
    # Until the model is retrained with MongoDB products,
    # barcode is used as the external product identifier.
    

    product_id = req.barcode


    
    # 5. Try ML prediction
    

    predicted = 0.0

    if product_id in _latest_by_product.index:

        row = _latest_by_product.loc[[product_id]].copy()

        row["PromoActive"] = (
            1 if req.promo_planned else 0
        )

        predicted = float(
            np.clip(
                MODEL.predict(row[FEATURE_COLS])[0],
                0,
                None
            )
        )


    
    # 6. Safety stock
    

    safety_stock = recent_avg * 7

    reorder_qty = max(
        0.0,
        predicted + safety_stock - current_stock
    )



    # 7. Expiry risk
    
    shelf_life = SHELF_LIFE_BY_CATEGORY.get(
        category,
        730
    )

    expected_sell_days = (
        current_stock / max(recent_avg, 0.01)
    )

    expiry_score = min(
        100.0,
        (expected_sell_days / shelf_life) * 100
    )

    risk_level = (
        "High"
        if expiry_score >= 70
        else "Medium"
        if expiry_score >= 40
        else "Low"
    )


    
    # 8. Return result
    

    return PredictResponse(

        barcode=req.barcode,

        medicine_name=medicine["name"],

        current_stock=round(
            current_stock,
            1
        ),

        predicted_units_next_30_days=round(
            predicted,
            1
        ),

        reorder_quantity=round(
            reorder_qty,
            1
        ),

        expiry_score=round(
            expiry_score,
            1
        ),

        risk_level=risk_level,
    )