![](./images/Pharmacy%20AI%20Demand%20Forecasting%20API.png)

# Pharmacy AI API Documentation

## Base URL

https://pharmteck-ai.up.railway.app


## 1. Predict Demand

### POST /predict

Predicts the expected demand for a product over the next 30 days
and calculates reorder quantity and expiry risk.

### Request Body

```json
{
  "product_id": "PR0014",
  "current_stock": 50,
  "category": "OTC",
  "promo_planned": false
}
````

### Fields

| Field           | Type    | Required | Description                                      |
| --------------- | ------- | -------- | ------------------------------------------------ |
| `product_id`    | string  | Yes      | Product ID used by the AI model                  |
| `current_stock` | number  | Yes      | Current stock quantity in the pharmacy           |
| `category`      | string  | No       | Product category. Default: `OTC`                 |
| `promo_planned` | boolean | No       | Whether a promotion is planned. Default: `false` |

### Response

```json
{
  "product_id": "PR0014",
  "predicted_units_next_30_days": 42.5,
  "reorder_quantity": 35.2,
  "expiry_score": 12.4,
  "risk_level": "Low"
}
```

### Response Fields

| Field                          | Type   | Description                          |
| ------------------------------ | ------ | ------------------------------------ |
| `product_id`                   | string | Requested product ID                 |
| `predicted_units_next_30_days` | number | Predicted sales for the next 30 days |
| `reorder_quantity`             | number | Recommended quantity to reorder      |
| `expiry_score`                 | number | Expiry risk score from 0 to 100      |
| `risk_level`                   | string | `Low`, `Medium`, or `High`           |


### Request Body

```json
{
  "product_id": "PR0014",
  "current_stock": 50,
  "category": "OTC",
  "promo_planned": false
}
```

### Request Fields

| Field           | Type    | Required | Description                                      |
| --------------- | ------- | -------- | ------------------------------------------------ |
| `product_id`    | string  | Yes      | Product ID used by the trained AI model          |
| `current_stock` | number  | Yes      | Current stock quantity                           |
| `category`      | string  | No       | Product category. Default: `OTC`                 |
| `promo_planned` | boolean | No       | Whether a promotion is planned. Default: `false` |


### Request Body

```json
{
  "product_id": "PR0014",
  "current_stock": 50,
  "category": "OTC",
  "promo_planned": false
}
```


### Request Fields

| Field           | Type    | Required | Description                                      |
| --------------- | ------- | -------- | ------------------------------------------------ |
| `product_id`    | string  | Yes      | Product ID used by the trained AI model          |
| `current_stock` | number  | Yes      | Current stock quantity                           |
| `category`      | string  | No       | Product category. Default: `OTC`                 |
| `promo_planned` | boolean | No       | Whether a promotion is planned. Default: `false` |

