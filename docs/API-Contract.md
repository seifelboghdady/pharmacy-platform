# Pharmacy Management System — API Contract

Base URL: `https://api.yourpharmacy.com/api`
كل الـ endpoints المحمية محتاجة header:
```
Authorization: Bearer <jwt_token>
```

كل الردود بتتبع الشكل الموحد ده:
```json
// Success
{ "success": true, "data": { ... } }

// Error
{ "success": false, "message": "وصف الخطأ", "code": "ERROR_CODE" }
```

---

## 1. Authentication

### POST /auth/register
**Request**
```json
{
  "name": "Ahmed Ali",
  "email": "ahmed@pharmacy.com",
  "password": "SecurePass123",
  "pharmacyName": "El Shifa Pharmacy",
  "phone": "01012345678"
}
```
**Response 201**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "665f1a2b3c4d5e6f7a8b9c0d",
      "name": "Ahmed Ali",
      "email": "ahmed@pharmacy.com",
      "role": "pharmacist",
      "pharmacyName": "El Shifa Pharmacy",
      "phone": "01012345678"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```
**Errors**: `400 EMAIL_ALREADY_EXISTS`, `422 VALIDATION_ERROR`

### POST /auth/login
**Request**
```json
{ "email": "ahmed@pharmacy.com", "password": "SecurePass123" }
```
**Response 200** — نفس شكل الـ register response
**Errors**: `401 INVALID_CREDENTIALS`

### POST /auth/refresh-token
**Request**
```json
{ "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
```
**Response 200**
```json
{ "success": true, "data": { "token": "new_access_token" } }
```

---

## 2. Dashboard

### GET /dashboard
**Response 200**
```json
{
  "success": true,
  "data": {
    "pharmacyStatus": "open",
    "quickStats": {
      "totalMedicines": 1240,
      "lowStockCount": 18,
      "missingMedicinesCount": 7,
      "pendingOrdersCount": 3
    },
    "recentDispensing": [
      {
        "id": "665f...",
        "medicineName": "Panadol Extra",
        "quantityDispensed": 2,
        "createdAt": "2026-09-01T10:22:00Z"
      }
    ],
    "highRiskAlerts": [
      {
        "medicineId": "665f...",
        "medicineName": "Augmentin 1g",
        "riskScore": 82,
        "daysUntilStockout": 3
      }
    ]
  }
}
```

---

## 3. Medicine Search

### GET /medicines/search?query=panadol&type=name
`type` = `name` | `barcode` (اختياري، افتراضي بيدور في الاتنين)

**Response 200**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "665f1a2b3c4d5e6f7a8b9c0d",
        "name": "Panadol Extra",
        "barcode": "6221031200159",
        "manufacturer": "GSK",
        "price": 25.5,
        "stockQuantity": 120,
        "unit": "strip"
      }
    ],
    "count": 1
  }
}
```

---

## 4. Medicine Details

### GET /medicines/:id
**Response 200**
```json
{
  "success": true,
  "data": {
    "id": "665f1a2b3c4d5e6f7a8b9c0d",
    "name": "Panadol Extra",
    "barcode": "6221031200159",
    "description": "مسكن للألم وخافض للحرارة",
    "manufacturer": "GSK",
    "price": 25.5,
    "stockQuantity": 120,
    "unit": "strip",
    "category": "Painkillers",
    "expiryDate": "2027-03-01T00:00:00Z",
    "riskInfo": {
      "riskScore": 12,
      "expiryRiskLevel": "low",
      "daysUntilStockout": 45
    }
  }
}
```
**Errors**: `404 MEDICINE_NOT_FOUND`

---

## 5. Medicine Dispensing

### POST /medicines/:id/dispense
**Request**
```json
{
  "quantityDispensed": 2,
  "patientName": "Sara Mohamed"
}
```
**Response 200**
```json
{
  "success": true,
  "data": {
    "transaction": {
      "id": "665f...",
      "medicine": "665f1a2b3c4d5e6f7a8b9c0d",
      "quantityDispensed": 2,
      "totalPrice": 51.0,
      "patientName": "Sara Mohamed",
      "createdAt": "2026-09-02T09:15:00Z"
    },
    "updatedStockQuantity": 118
  }
}
```
**Errors**: `400 INSUFFICIENT_STOCK`, `404 MEDICINE_NOT_FOUND`

---

## 6. Add Missing Medicine

### POST /missing-medicines
**Request**
```json
{
  "medicineName": "Augmentin 1g",
  "barcode": "6221031299999",
  "requiredQuantity": 30,
  "notes": "مطلوب بشكل عاجل"
}
```
**Response 201**
```json
{
  "success": true,
  "data": {
    "id": "665f...",
    "medicineName": "Augmentin 1g",
    "barcode": "6221031299999",
    "requiredQuantity": 30,
    "status": "pending",
    "source": "manual",
    "requestedBy": "665f1a2b3c4d5e6f7a8b9c0d",
    "notes": "مطلوب بشكل عاجل",
    "createdAt": "2026-09-02T09:20:00Z"
  }
}
```

---

## 7. Missing Medicines List

### GET /missing-medicines?status=pending&page=1&limit=20
`status` اختياري: `pending` | `ordered` | `resolved`

**Response 200**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "665f...",
        "medicineName": "Augmentin 1g",
        "requiredQuantity": 30,
        "status": "pending",
        "source": "manual",
        "createdAt": "2026-09-02T09:20:00Z"
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 7, "totalPages": 1 }
  }
}
```

---

## 8. Create Order (يدوي)

### POST /orders
**Request**
```json
{
  "supplierName": "Egyptian Drug Company",
  "items": [
    { "medicineName": "Panadol Extra", "medicine": "665f1a2b3c4d5e6f7a8b9c0d", "requiredQuantity": 100, "unitPrice": 20 },
    { "medicineName": "Vitamin C 1000mg", "requiredQuantity": 50 }
  ],
  "notes": "طلب شهري"
}
```
**Response 201**
```json
{
  "success": true,
  "data": {
    "id": "665f...",
    "generatedAutomatically": false,
    "createdBy": "665f1a2b3c4d5e6f7a8b9c0d",
    "supplierName": "Egyptian Drug Company",
    "items": [
      { "medicineName": "Panadol Extra", "medicine": "665f1a2b3c4d5e6f7a8b9c0d", "requiredQuantity": 100, "unitPrice": 20 },
      { "medicineName": "Vitamin C 1000mg", "requiredQuantity": 50, "unitPrice": null }
    ],
    "status": "pending",
    "totalAmount": 2000,
    "createdAt": "2026-09-02T09:30:00Z"
  }
}
```

---

## 9. Orders List

### GET /orders?status=pending&page=1&limit=20
**Response 200**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "665f...",
        "generatedAutomatically": true,
        "supplierName": null,
        "status": "pending",
        "totalAmount": 850,
        "itemsCount": 5,
        "createdAt": "2026-09-02T08:00:00Z"
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 3, "totalPages": 1 }
  }
}
```

### GET /orders/:id — تفاصيل طلب واحد
**Response 200**
```json
{
  "success": true,
  "data": {
    "id": "665f...",
    "generatedAutomatically": true,
    "items": [
      { "medicineName": "Augmentin 1g", "requiredQuantity": 30, "unitPrice": null, "missingMedicine": "665f..." }
    ],
    "status": "pending",
    "totalAmount": null,
    "createdAt": "2026-09-02T08:00:00Z"
  }
}
```

---

## 10. AI Inventory Risk

### GET /medicines/:id/risk
**Response 200**
```json
{
  "success": true,
  "data": {
    "medicineId": "665f1a2b3c4d5e6f7a8b9c0d",
    "riskScore": 82,
    "predictedStockoutDate": "2026-09-05T00:00:00Z",
    "daysUntilStockout": 3,
    "expiryRiskLevel": "low",
    "recommendedReorderQty": 60,
    "lastCalculatedAt": "2026-09-02T06:00:00Z"
  }
}
```

### GET /inventory/risk-dashboard?level=high
`level` اختياري: `low` | `medium` | `high`

**Response 200**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "medicineId": "665f...",
        "medicineName": "Augmentin 1g",
        "riskScore": 82,
        "daysUntilStockout": 3,
        "expiryRiskLevel": "low"
      }
    ],
    "count": 18
  }
}
```

### POST /inventory/risk/recalculate
**Request**: بدون body
**Response 202**
```json
{ "success": true, "data": { "message": "جاري إعادة الحساب", "startedAt": "2026-09-02T09:40:00Z" } }
```

---

## HTTP Status Codes المستخدمة
| Code | المعنى |
|------|--------|
| 200 | نجاح عملية عادية (GET/PUT) |
| 201 | إنشاء مورد جديد (POST) |
| 202 | العملية اتقبلت وبتتنفذ في الخلفية |
| 400 | خطأ في الطلب (بيانات ناقصة/غلط) |
| 401 | مش مسجل دخول / التوكن غلط |
| 403 | مفيش صلاحية |
| 404 | المورد مش موجود |
| 422 | فشل التحقق من صحة البيانات (validation) |
| 500 | خطأ في السيرفر |