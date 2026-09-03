const express = require("express");

const app = express();
const userRoutes = require("./routes/user.routes");
const medicineRoutes = require("./routes/medicine.routes");

app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/medicines", medicineRoutes);

module.exports = app;