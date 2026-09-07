# Data Consistency

## 1. Overview

Data consistency ensures that pharmacy operations do not leave the database in an invalid state.

The main consistency-sensitive operations are:

- Dispensing medicines.
- Updating stock quantities.
- Receiving supplier orders.
- Updating missing medicine requests.
- Maintaining relationships between orders and missing medicines.

---

## 2. Stock Consistency

Stock quantity is updated whenever a medicine is dispensed or an order is received.

### Dispensing

Before dispensing:

1. Validate the request.
2. Check that the medicine exists.
3. Check that enough stock is available.
4. Calculate the total price.
5. Create the dispensing transaction.
6. Decrease the medicine stock.

The system prevents dispensing more medicine than the available stock.

---

## 3. Order Receiving

When an order changes to `received`:
![](./images/OrderFlow.jfif)

This keeps inventory and missing-medicine records synchronized with the order status.

---

## 4. Missing Medicine Consistency

Missing medicines follow a controlled lifecycle:

![](./images/MedicinLifeCycle.jfif)

When an order is generated from pending missing medicines, the related records are associated with that order.

---

## 5. Validation

Data consistency is supported by multiple validation layers:

* Joi validates API input.
* Mongoose validates database documents.
* Stock checks prevent invalid dispensing.
* MongoDB references maintain relationships between entities.
* Enum fields restrict invalid statuses and roles.

Validation therefore happens before data reaches the database whenever possible.

---

## 6. MongoDB Transactions

The current development environment uses a standalone MongoDB instance.

MongoDB transactions require a replica set or mongos deployment, so transactions are currently not enabled.

Instead, the application performs the required operations sequentially.

This is suitable for the current MVP/development environment but has limitations for highly critical multi-document operations.

---

## 7. Future Production Improvement

For production, the database can be deployed as a MongoDB replica set.

This would allow the system to use transactions for operations such as:

![](./images/integrateMedicinStock.jfif)
A transaction would ensure that either all related operations succeed or they are rolled back together.

---

## 8. Consistency Principles

The system follows these principles:

* Never allow negative stock.
* Validate data before persistence.
* Keep inventory and catalog data separated.
* Maintain explicit relationships between orders and missing medicines.
* Restrict state changes using predefined statuses.
* Use database constraints as an additional integrity layer.
* Introduce MongoDB transactions when the production infrastructure supports them.

---

## 9. Summary

The current system provides application-level consistency through:

```text
Validation
   +
Business Rules
   +
MongoDB Constraints
   +
Controlled State Transitions
```

The current MVP prioritizes simplicity and compatibility with standalone MongoDB.

For production-scale deployment, **MongoDB Replica Set + Transactions** is the recommended next step for stronger multi-document consistency.
