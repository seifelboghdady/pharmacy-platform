## Overview

The Pharmacy Platform uses MongoDB as its primary database.

MongoDB is treated as the system's **Source of Truth**, while Redis is used only as a performance optimization layer.

The database design separates:

- User and authentication data
- Master medicine information
- Pharmacy-specific inventory
- Missing medicine requests
- Supplier purchase orders
- Medicine dispensing transactions

The design focuses on data ownership, scalability, query performance, and minimizing unnecessary duplication.

---

## Database Technology

| Component | Technology |
|---|---|
| Database | MongoDB |
| ODM | Mongoose |
| Cache | Redis |
| Database Model | Document-oriented |
| Primary Identifier | MongoDB ObjectId |

Mongoose is used to define schemas, relationships, validation constraints, and indexes.

---

## Collections

The current backend uses the following main collections:

```text
users
medicinecatalogs
medicines
missingmedicines
orders
dispensingtransactions
````

Each collection represents a specific business domain.

---

## User Collection

The `User` collection stores pharmacy users and authentication information.

### Fields

```text
name
email
password
role
pharmacyName
phone
createdAt
updatedAt
```

### Role

The system currently supports two roles:

```text
owner
employee
```

The role determines which operations a user can perform through the backend authorization layer.

### Security

Passwords are stored as hashed values.

The password field is configured with:

```js
select: false
```

This prevents the password hash from being returned by default in database queries.

---

## MedicineCatalog Collection

`MedicineCatalog` represents the master medicine dataset.

It contains information that describes the medicine itself rather than its inventory inside a specific pharmacy.

### Fields

```text
name
barcode
activeIngredient
manufacturer
category
dosageForm
strength
createdAt
updatedAt
```

### Example

```json
{
  "name": "Panadol Extra",
  "barcode": "628100000003",
  "activeIngredient": "Paracetamol + Caffeine",
  "manufacturer": "GSK",
  "category": "Analgesic",
  "dosageForm": "Tablet",
  "strength": "500mg + 65mg"
}
```

### Barcode Uniqueness

The barcode is configured as unique.

```text
barcode → UNIQUE INDEX
```

This prevents multiple catalog records from representing the same barcode.

---

## Medicine Collection

The `Medicine` collection represents a medicine inside a pharmacy's inventory.

Unlike `MedicineCatalog`, it contains pharmacy-specific information.

### Fields

```text
medicineCatalog
price
stockQuantity
expiryDate
supplier
createdAt
updatedAt
```

### Relationship

```text
MedicineCatalog
      │
      │ ObjectId reference
      ▼
Medicine
```

The `medicineCatalog` field references a document from the `MedicineCatalog` collection.

### Example

```json
{
  "medicineCatalog": "6a9d69ea32ca32254bec67ce",
  "price": 55,
  "stockQuantity": 118,
  "expiryDate": "2027-12-31T00:00:00.000Z",
  "supplier": "ABC Pharma"
}
```

---

## Why MedicineCatalog and Medicine Are Separate

Separating the two entities is one of the main database design decisions in the platform.

### Master Data

`MedicineCatalog` contains information that describes the medicine:

```text
name
barcode
activeIngredient
manufacturer
category
dosageForm
strength
```

### Pharmacy Data

`Medicine` contains information that belongs to the pharmacy:

```text
price
stockQuantity
expiryDate
supplier
```

This separation provides several benefits.

### 1. Reduced Duplication

Medicine information does not need to be duplicated inside every inventory record.

### 2. Clear Data Ownership

The catalog owns general medicine information.

The inventory record owns pharmacy-specific information.

### 3. Independent Updates

Changing pharmacy stock does not modify the master medicine definition.

### 4. Shared References

Multiple pharmacy inventory records can reference the same catalog medicine.

```text
                  MedicineCatalog
                  "Panadol Extra"
                         │
              ┌──────────┼──────────┐
              ▼          ▼          ▼
          Pharmacy A  Pharmacy B  Pharmacy C
          Medicine    Medicine    Medicine
```

Each pharmacy can maintain its own:

```text
price
stockQuantity
expiryDate
supplier
```

while referencing the same master medicine.

### 5. Better Caching Strategy

The catalog is relatively stable and read-heavy.

This makes it a natural candidate for Redis caching.

---

## MissingMedicine Collection

`MissingMedicine` stores medicines that are currently unavailable or requested by pharmacy staff.

### Fields

```text
medicineName
barcode
requiredQuantity
status
requestedBy
notes
order
createdAt
updatedAt
```

### Status

The supported states are:

```text
pending
ordered
fulfilled
cancelled
```

### Relationship

```text
User
 │
 │ requestedBy
 ▼
MissingMedicine
```

The `requestedBy` field stores the user who reported the missing medicine.

### Order Relationship

Once missing medicines are included in an order, the record can reference the generated order:

```text
MissingMedicine
      │
      │ order
      ▼
Order
```

This allows the system to track the lifecycle of a missing medicine request.

---

## Order Collection

`Order` represents a purchase order sent by the pharmacy to a supplier.

It is not a customer sales order.

### Fields

```text
supplier
status
orderDate
createdBy
generatedAutomatically
items
createdAt
updatedAt
```

### Status

The supported states are:

```text
pending
received
cancelled
```

### Created By

Each order stores the user responsible for creating it.

```text
User
 │
 │ createdBy
 ▼
Order
```

The current system allows the pharmacy owner to create and manage orders.

---

## Order Items

Each order contains one or more medicine items.

The current implementation stores:

```text
medicineName
barcode
quantity
```

### Example

```json
{
  "medicineName": "Panadol Extra",
  "barcode": "628100000003",
  "quantity": 40
}
```

### Why Order Items Store Medicine Information Directly

An order represents a purchasing request at a specific point in time.

Storing the medicine name and barcode inside the order item preserves the information associated with that purchase request.

The order does not depend on the current pharmacy inventory document.

---

## Automatic Order Generation

The backend supports generating an order from pending missing medicines.

The process is:

```text
Missing Medicines
       │
       ▼
Find pending records
       │
       ▼
Group by barcode
       │
       ▼
Sum required quantities
       │
       ▼
Create Order
       │
       ▼
Mark MissingMedicine as ordered
```

### Example

If the pharmacy has:

```text
Panadol Extra → 20
Panadol Extra → 10
Panadol Extra → 10
```

The generated order contains:

```text
Panadol Extra → 40
```

This avoids creating duplicate order items for the same medicine.

---

## DispensingTransaction Collection

`DispensingTransaction` represents the dispensing or sale of a medicine from the pharmacy inventory.

### Fields

```text
medicine
quantity
totalPrice
dispensedBy
createdAt
updatedAt
```

### Relationships

```text
Medicine
   │
   │ medicine
   ▼
DispensingTransaction

User
 │
 │ dispensedBy
 ▼
DispensingTransaction
```

### Example

```json
{
  "medicine": "6a9d7c99d5d875bcb5301b02",
  "quantity": 2,
  "totalPrice": 110,
  "dispensedBy": "6a98bdfcdb8a96208b88e846"
}
```

The transaction references the pharmacy inventory record rather than the catalog directly.

This is important because the transaction needs the pharmacy-specific price and stock information.

---

## Stock Management

When a dispensing transaction is created:

```text
Current Stock
      │
      ▼
Check Availability
      │
      ├── Insufficient → Reject
      │
      └── Available
              │
              ▼
        Calculate Total
              │
              ▼
       Create Transaction
              │
              ▼
        Decrease Stock
```

For example:

```text
Stock = 120
Quantity = 2

New Stock = 118
```

The transaction stores the calculated total price.

```text
totalPrice = price × quantity
```

---

## Order Receiving and Stock Updates

When an order is marked as received, the ordered quantities can be added to pharmacy inventory.

```text
Order
  │
  ▼
Status = received
  │
  ▼
Find inventory medicine
  │
  ▼
Increase stockQuantity
```

The related missing medicine records can then be marked as fulfilled.

---

## Data Relationships

The main relationships can be represented as:

```text
User
 │
 ├───────────────┐
 │               │
 ▼               ▼
MissingMedicine  Order
 │               │
 │               │
 └───────┐       │
         ▼       │
        Order ◄──┘


MedicineCatalog
      │
      │
      ▼
Medicine
      │
      ▼
DispensingTransaction

User
 │
 ├── requestedBy ──► MissingMedicine
 │
 ├── createdBy ────► Order
 │
 └── dispensedBy ──► DispensingTransaction
```

---

## Referential Strategy

MongoDB references are implemented using Mongoose `ObjectId` references.

Examples:

```js
ref: "MedicineCatalog"
```

```js
ref: "User"
```

```js
ref: "Order"
```

```js
ref: "Medicine"
```

These references allow the backend to use Mongoose `populate()` when related data is required.

---

## Indexing Strategy

Indexes are added based on expected query patterns.

### MedicineCatalog

```text
barcode   → Unique Index
name      → Index
category  → Index
```

### Medicine

```text
medicineCatalog → Index
expiryDate      → Index
```

### Indexing Goals

The indexes support common operations such as:

```text
MedicineCatalog
 ├── Search by barcode
 ├── Search by name
 └── Filter by category

Medicine
 ├── Find inventory by catalog medicine
 ├── Find expired medicines
 └── Find medicines approaching expiration
```

Indexes reduce unnecessary collection scans for these frequently executed queries.

---

## Query Design

The backend uses different query strategies depending on the data domain.

### Catalog Search

Search criteria such as:

```text
name
barcode
category
```

are applied to `MedicineCatalog`.

### Inventory Search

Inventory-specific criteria such as:

```text
expiryDate
medicineCatalog
```

are applied to `Medicine`.

This keeps queries aligned with the ownership of each field.

---

## Pagination

The inventory API supports pagination.

Example:

```http
GET /api/medicines?page=1&limit=10
```

The backend calculates:

```text
skip = (page - 1) × limit
```

This prevents large datasets from being returned in a single request.

The API also returns:

```text
page
limit
total
pages
medicines
```

---

## Data Consistency

MongoDB is the authoritative source for persistent data.

Redis does not own persistent state.

The architecture follows:

```text
MongoDB
   │
   │ Source of Truth
   ▼
Persistent Data

Redis
   │
   │ Temporary Cache
   ▼
Performance Optimization
```

If Redis data is lost, it can be rebuilt from MongoDB.

---

## Database Design Principles

### Single Responsibility

Each collection represents a specific business domain.

### Clear Ownership

Each field belongs to the entity responsible for maintaining it.

### Controlled Duplication

Data is duplicated only when there is a clear historical or business reason.

### Reference-Based Relationships

Related entities use MongoDB `ObjectId` references where appropriate.

### Query-Oriented Indexing

Indexes are designed around actual application queries.

### Performance Awareness

Pagination, indexing, and caching are considered part of the database architecture rather than afterthoughts.

### Source of Truth

MongoDB remains authoritative even when Redis is used.

---

## Database Architecture Summary

![Photo](\images\DBdesign.png)

The resulting database structure separates master data, pharmacy-specific operational data, and transactional records while maintaining clear relationships between them.
