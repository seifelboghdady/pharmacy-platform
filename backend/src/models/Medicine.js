const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    barcode:{
        type: String,
        required: true,
        unique: true
    },
    manufacturer: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    stockQuantity: {
        type: Number,
        required: true,
        min: 0
    },
    expiryDate: {
        type: Date,
        required: true
    },
    supplier: {
        type: String,
        required: true
    },
    unit: {
        type: String,
        required: true
    }
}, {timestamps: true});

module.exports = mongoose.model("Medicine", medicineSchema);