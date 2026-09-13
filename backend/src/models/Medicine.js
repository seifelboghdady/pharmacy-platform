const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema({
    medicineCatalog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MedicineCatalog",
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
    }
}, {timestamps: true});

medicineSchema.index({ medicineCatalog: 1 });
medicineSchema.index({ expiryDate: 1 });

module.exports = mongoose.model("Medicine", medicineSchema);