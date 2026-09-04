const express = require("express");

const app = express();
const userRoutes = require("./routes/user.routes");
const medicineRoutes = require("./routes/medicine.routes");
const orderRoutes = require("./routes/order.routes");

app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/orders", orderRoutes);

module.exports = app;