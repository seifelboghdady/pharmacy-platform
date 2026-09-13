const Medicine = require("../models/Medicine");
const MedicineCatalog = require("../models/MedicineCatalog");
const { createMedicineSchema, updateMedicineSchema } = require("../validations/medicine.validation");

const createMedicine = async (req, res) => {
  try {
    const { error, value } = createMedicineSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: error.details[0].message
      });
    }

    const catalogMedicine = await MedicineCatalog.findById(
      value.medicineCatalog
    );

    if (!catalogMedicine) {
      return res.status(404).json({
        message: "Medicine not found in catalog"
      });
    }

    const medicine = await Medicine.create(value);

    return res.status(201).json(medicine);
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

const getMedicines = async (req, res) => {
  try {
    const {
      name,
      barcode,
      category,
      expired,
      page = 1,
      limit = 10
    } = req.query;

    const filter = {};

    // Search in MedicineCatalog
    if (name || barcode || category) {
      const catalogFilter = {};

      if (name) {
        catalogFilter.name = {
          $regex: name,
          $options: "i"
        };
      }

      if (barcode) {
        catalogFilter.barcode = barcode;
      }

      if (category) {
        catalogFilter.category = category;
      }

      const catalogMedicines = await MedicineCatalog.find(
        catalogFilter
      ).select("_id");

      const catalogIds = catalogMedicines.map(
        (medicine) => medicine._id
      );

      filter.medicineCatalog = {
        $in: catalogIds
      };
    }

    // Search by expiry date in Medicine
    if (expired === "true") {
      filter.expiryDate = {
        $lt: new Date()
      };
    }

    if (expired === "soon") {
      const today = new Date();

      const thirtyDaysLater = new Date();
      thirtyDaysLater.setDate(today.getDate() + 30);

      filter.expiryDate = {
        $gte: today,
        $lte: thirtyDaysLater
      };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const medicines = await Medicine.find(filter)
      .populate("medicineCatalog")
      .skip(skip)
      .limit(Number(limit));

    const total = await Medicine.countDocuments(filter);

    return res.status(200).json({
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
      medicines
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Something went wrong"
    });
  }
};

const getMedicineById = async (req, res) => {
    const medicine = await Medicine.findById(req.params.id)
    .populate("medicineCatalog");
    if (!medicine) {
    return res.status(404).json({
        message: "Medicine not found"
    });
    }
    return res.status(200).json(medicine);
};

const updateMedicine = async (req, res) => {
  try {
    const { error, value } = updateMedicineSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: error.details[0].message
      });
    }

    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
      return res.status(404).json({
        message: "Medicine not found"
      });
    }

    // If medicineCatalog is being changed,
    // make sure the new catalog medicine exists
    if (value.medicineCatalog) {
      const catalogMedicine = await MedicineCatalog.findById(
        value.medicineCatalog
      );

      if (!catalogMedicine) {
        return res.status(404).json({
          message: "Medicine not found in catalog"
        });
      }
    }

    Object.assign(medicine, value);

    await medicine.save();

    await medicine.populate("medicineCatalog");

    return res.status(200).json({
      message: "Medicine updated successfully",
      medicine
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

const deleteMedicine = async (req, res) => {
    const medicine = await Medicine.findByIdAndDelete(req.params.id);
    if(!medicine){
        return res.status(404).json({
            message: "Medicine not found"
        });
    }
    return res.status(200).json({
        message: "Medicine deleted successfully"
    });
};

module.exports = {
  createMedicine,
  getMedicines,
  getMedicineById,
  updateMedicine,
  deleteMedicine
};