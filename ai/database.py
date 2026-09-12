import os
import pandas as pd
from pymongo import MongoClient
from dotenv import load_dotenv


load_dotenv()

client = MongoClient(os.getenv("MONGO_URI"))
db = client["test"]

print("MongoDB connected")


def get_medicine_by_barcode(barcode):
    catalog = db["medicinecatalogs"].find_one({
        "barcode": barcode
    })

    if not catalog:
        return None

    medicine = db["medicines"].find_one({
        "medicineCatalog": catalog["_id"]
    })

    if not medicine:
        return None

    return {
        "barcode": catalog["barcode"],
        "name": catalog["name"],
        "category": catalog.get("category", "OTC"),
        "stockQuantity": medicine.get("stockQuantity", 0),
        "price": medicine.get("price", 0),
        "expiryDate": medicine.get("expiryDate"),
        "medicine_id": medicine["_id"]
    }


def get_sales_by_barcode(barcode):
    medicine = get_medicine_by_barcode(barcode)

    if not medicine:
        return []

    transactions = db["dispensingtransactions"].find({
        "medicine": medicine["medicine_id"]
    }).sort("createdAt", 1)

    return [
        {
            "date": transaction["createdAt"],
            "units_sold": transaction["quantity"]
        }
        for transaction in transactions
    ]


def get_daily_sales_by_barcode(barcode):
    sales = get_sales_by_barcode(barcode)

    if not sales:
        return pd.DataFrame(
            columns=[
                "Date",
                "UnitsSold",
                "sales_last_7_days",
                "sales_last_30_days",
                "rolling_avg_14_days",
                "day_of_week",
                "month",
                "is_holiday",
                "PromoActive",
            ]
        )

    df = pd.DataFrame(sales)

    df["Date"] = pd.to_datetime(df["date"]).dt.normalize()

    daily = (
        df.groupby("Date", as_index=False)["units_sold"]
        .sum()
        .rename(columns={"units_sold": "UnitsSold"})
    )

    full_dates = pd.date_range(
        start=daily["Date"].min(),
        end=pd.Timestamp.today().normalize(),
        freq="D"
    )

    daily = (
        daily.set_index("Date")
        .reindex(full_dates, fill_value=0)
        .rename_axis("Date")
        .reset_index()
    )

    daily["sales_last_7_days"] = (
        daily["UnitsSold"]
        .rolling(7)
        .sum()
        .shift(1)
    )

    daily["sales_last_30_days"] = (
        daily["UnitsSold"]
        .rolling(30)
        .sum()
        .shift(1)
    )

    daily["rolling_avg_14_days"] = (
        daily["UnitsSold"]
        .rolling(14)
        .mean()
        .shift(1)
    )

    daily["day_of_week"] = daily["Date"].dt.dayofweek
    daily["month"] = daily["Date"].dt.month

    # Temporary until we connect the real holiday calendar
    daily["is_holiday"] = 0

    # Temporary until promotions are stored in MongoDB
    daily["PromoActive"] = 0

    return daily