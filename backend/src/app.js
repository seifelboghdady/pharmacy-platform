const express = require("express");

const app = express();
const userRoutes = require("./routes/user.routes");
const medicineRoutes = require("./routes/medicine.routes");
const orderRoutes = require("./routes/order.routes");
const missingMedicineRoutes = require("./routes/missingMedicine.routes");
const dispensingTransactionRoutes = require("./routes/dispensingTransaction.routes");


app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/missing-medicines", missingMedicineRoutes);
app.use("/api/dispensing-transactions",dispensingTransactionRoutes);

module.exports = app;