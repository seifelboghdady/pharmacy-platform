const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({

    generatedAutomatically: {
    type: Boolean,
    default: false
    },
    supplier: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ["pending", "received", "cancelled"],
        default: "pending"
    },
    orderDate: {
        type: Date,
        default: Date.now
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    items: [
        {
            medicine: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Medicine",
            required: true
            },
            quantity: {
            type: Number,
            required: true,
            min: 1
            }
        }
    ],
},{timestamps: true});

module.exports = mongoose.model("Order", orderSchema);