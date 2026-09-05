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
    enum: ["pending", "ordered", "fulfilled", "cancelled"],
    default: "pending"
    },
    notes: {
    type: String
    },
    order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    default: null
    }
},{timestamps: true});

module.exports = mongoose.model("MissingMedicine", missingMedicineSchema);