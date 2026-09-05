const Medicine = require("../models/Medicine");
const { createMedicineSchema, updateMedicineSchema } = require("../validations/medicine.validation");

const createMedicine = async (req, res) => {
    try{

        const { error, value } = createMedicineSchema.validate(req.body);
    
        if (error) {
        return res.status(400).json({
            message: error.details[0].message
        });
        }
        const medicine = await Medicine.create(value);
        return res.status(201).json(medicine);
    }catch(error){
        console.log(error);
        return res.status(500).json({
            message: "Something went wrong"
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

    if (expired === "true") {
      filter.expiryDate = { $lt: new Date() };
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
    const skip = (page - 1) * limit;

    const medicines = await Medicine.find(filter)
      .skip(skip)
      .limit(Number(limit));

    const total = await Medicine.countDocuments(filter);

    return res.status(200).json({
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit),
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
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
    return res.status(404).json({
        message: "Medicine not found"
    });
    }
    return res.status(200).json(medicine);
};

const updateMedicine = async (req, res) => {
    const { error, value } = updateMedicineSchema.validate(req.body);
    if (error) {
    return res.status(400).json({
        message: error.details[0].message
    });
    }
    const medicine = await Medicine.findByIdAndUpdate(
        req.params.id,
        value,
        { new: true }
    );
    if (!medicine) {
        return res.status(404).json({
            message: "Medicine not found"
        });
    }
    return res.status(200).json(medicine);
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