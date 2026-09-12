"""
STEP 1 — Cleaning + Feature Engineering
Pharmacy demand forecasting pipeline (EU Pharmacy dataset)

Unchanged by the mentor-feedback pass except this note: the columns
produced here (day_of_week, month, is_holiday, sales_last_7_days,
sales_last_30_days, rolling_avg_14_days, PromoActive, ProductID, Category)
now feed a single global LightGBM model (see features.py / train_models.py)
instead of a separate Prophet model per product. Run this file first, as
before; then run `train_models.py` (new step 2) before step 3 / the API / the UI.
"""
import pandas as pd
import numpy as np


# 1) LOAD

xls = pd.ExcelFile("Pharmacy_data.xlsx")
fact = pd.read_excel(xls, "FactSales")
date = pd.read_excel(xls, "DimDate")
prod = pd.read_excel(xls, "DimProduct")
pharm = pd.read_excel(xls, "DimPharmacy")


# 2) CLEANING

# no nulls found earlier, but enforce types defensively
fact = fact.drop_duplicates(subset="SalesID")
date["Date"] = pd.to_datetime(date["Date"])
prod["LaunchDate"] = pd.to_datetime(prod["LaunchDate"])
prod["DiscontinuedDate"] = pd.to_datetime(prod["DiscontinuedDate"])

# drop discontinued products from active forecasting scope (still keep for reference)
active_products = prod[prod["IsDiscontinued"] == "No"].copy()

# merge sales with real calendar dates + product info
merged = fact.merge(date[["DateKey", "Date"]], on="DateKey", how="left")
merged = merged.merge(prod[["ProductID", "ProductName", "Category", "IsGeneric", "ListPriceEUR"]],
                       on="ProductID", how="left")


# 3) AGGREGATE TO NATIONAL DAILY DEMAND PER PRODUCT
#    (sum across all 120 pharmacies -> one series per product)

daily = merged.groupby(["ProductID", "ProductName", "Category", "Date"])["UnitsSold"].sum().reset_index()

# promo indicator: was this product on promotion (in any pharmacy) on this day?
daily_promo = merged.assign(IsPromo=(merged["PromoFlag"] == "Yes").astype(int)) \
    .groupby(["ProductID", "Date"])["IsPromo"].max().reset_index() \
    .rename(columns={"IsPromo": "PromoActive"})


# 4) FILL MISSING DAYS WITH 0 (no sale that day is real information)
#    Pivot to Date x ProductID grid, reindex full calendar, melt back.

full_calendar = date[["Date"]].drop_duplicates().sort_values("Date")

pivot = daily.pivot_table(index="Date", columns="ProductID", values="UnitsSold", aggfunc="sum")
pivot = pivot.reindex(full_calendar["Date"]).fillna(0)

daily_full = pivot.reset_index().melt(id_vars="Date", var_name="ProductID", value_name="UnitsSold")

# same for promo (0 = no promo that day, including days with no sales at all)
promo_pivot = daily_promo.pivot_table(index="Date", columns="ProductID", values="PromoActive", aggfunc="max")
promo_pivot = promo_pivot.reindex(full_calendar["Date"]).fillna(0)
promo_long = promo_pivot.reset_index().melt(id_vars="Date", var_name="ProductID", value_name="PromoActive")

daily_full = daily_full.merge(promo_long, on=["Date", "ProductID"], how="left")
daily_full["PromoActive"] = daily_full["PromoActive"].fillna(0)

# reattach product name / category
daily_full = daily_full.merge(
    daily[["ProductID", "ProductName", "Category"]].drop_duplicates(),
    on="ProductID", how="left"
)
daily_full = daily_full.sort_values(["ProductID", "Date"]).reset_index(drop=True)

print("Daily full-calendar shape:", daily_full.shape)
print("Products covered:", daily_full['ProductID'].nunique())
print("Days with an active promo (any product):", (daily_full['PromoActive'] > 0).sum())


# 5) FEATURE ENGINEERING

egypt_style_holidays_2024_2025 = pd.to_datetime([
    "2024-01-01", "2024-04-10", "2024-04-11", "2024-06-16", "2024-12-25",
    "2025-01-01", "2025-03-31", "2025-04-01", "2025-06-06", "2025-12-25",
])  # placeholder EU-style public holidays; replace with real per-country calendar later

daily_full["day_of_week"] = daily_full["Date"].dt.dayofweek
daily_full["month"] = daily_full["Date"].dt.month
daily_full["is_holiday"] = daily_full["Date"].isin(egypt_style_holidays_2024_2025).astype(int)

daily_full = daily_full.sort_values(["ProductID", "Date"])
grp = daily_full.groupby("ProductID")["UnitsSold"]

daily_full["sales_last_7_days"] = grp.transform(lambda x: x.rolling(7).sum().shift(1))
daily_full["sales_last_30_days"] = grp.transform(lambda x: x.rolling(30).sum().shift(1))
daily_full["rolling_avg_14_days"] = grp.transform(lambda x: x.rolling(14).mean().shift(1))


# 6) SIMULATED SHELF LIFE (real dataset has no expiry field — flagged clearly)

shelf_life_by_category = {
    "OTC": 730, "Personal Care": 1095, "Prescription": 540,
    "Wellness": 730, "Medical Devices": 1825
}
prod["SimulatedShelfLifeDays"] = prod["Category"].map(shelf_life_by_category)


# 7) SAVE FOR NEXT STEP

daily_full.to_parquet("daily_features.parquet", index=False)
prod.to_parquet("product_ref.parquet", index=False)

print("\nSample feature rows (PR0099):")
print(daily_full[daily_full["ProductID"]=="PR0099"].tail(8)[
    ["Date","UnitsSold","day_of_week","sales_last_7_days","sales_last_30_days","rolling_avg_14_days"]
])
