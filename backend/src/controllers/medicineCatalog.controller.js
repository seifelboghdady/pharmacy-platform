const MedicineCatalog = require("../models/MedicineCatalog");
const {createMedicineCatalogSchema} = require("../validations/medicineCatalog.validation");

const createMedicineCatalog = async (req, res) => {
  try {
    const { error, value } = createMedicineCatalogSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: error.details[0].message
      });
    }

    const medicine = await MedicineCatalog.create(value);

    return res.status(201).json({
      message: "Medicine added to catalog successfully",
      medicine
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Medicine with this barcode already exists"
      });
    }

    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

const getMedicineCatalog = async (req, res) => {
  try {
    const { name, barcode, category } = req.query;

    const filter = {};

    if (name) {
      filter.name = {
        $regex: name,
        $options: "i"
      };
    }

    if (barcode) {
      filter.barcode = barcode;
    }

    if (category) {
      filter.category = category;
    }

    const medicines = await MedicineCatalog.find(filter);

    return res.status(200).json(medicines);
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

const getMedicineCatalogById = async (req, res) => {
  try {
    const medicine = await MedicineCatalog.findById(req.params.id);

    if (!medicine) {
      return res.status(404).json({
        message: "Medicine not found in catalog"
      });
    }

    return res.status(200).json(medicine);
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

module.exports = {
  createMedicineCatalog,
  getMedicineCatalog,
  getMedicineCatalogById
};