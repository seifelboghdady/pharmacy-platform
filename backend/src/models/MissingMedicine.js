const mongoose = require("mongoose");

const missingMedicineSchema = new mongoose.Schema({
    medicineName: {
    type: String,
    required: true
    },
    barcode: {
    type: String,
    required: true
    },
    requiredQuantity: {
    type: Number,
    required: true,
    min: 1
    },
    status: {
    type: String,
    required: true,
    enum: ["pending", "fulfilled", "cancelled"],
    default: "pending"
    },
    notes: {
    type: String
    }
},{timestamps: true});

module.exports = mongoose.model("MissingMedicine", missingMedicineSchema);