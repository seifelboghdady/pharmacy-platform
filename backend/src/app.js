const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");


const app = express();
const userRoutes = require("./routes/user.routes");
const authRoutes = require("./routes/auth.routes");
const medicineRoutes = require("./routes/medicine.routes");
const orderRoutes = require("./routes/order.routes");
const missingMedicineRoutes = require("./routes/missingMedicine.routes");
const dispensingTransactionRoutes = require("./routes/dispensingTransaction.routes");

// Security & logging middleware
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));

app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/missing-medicines", missingMedicineRoutes);
app.use("/api/dispensing-transactions",dispensingTransactionRoutes);

module.exports = app;