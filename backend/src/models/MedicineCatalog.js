const mongoose = require("mongoose");

const medicineCatalogSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    barcode: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    activeIngredient: {
      type: String,
      trim: true
    },

    manufacturer: {
      type: String,
      trim: true
    },

    category: {
      type: String,
      trim: true
    },

    dosageForm: {
      type: String,
      trim: true
    },

    strength: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

medicineCatalogSchema.index({ name: 1 });
medicineCatalogSchema.index({ category: 1 });

module.exports = mongoose.model("MedicineCatalog",medicineCatalogSchema);