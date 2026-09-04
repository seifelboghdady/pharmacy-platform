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
    const medicines = await Medicine.find();
    return res.status(200).json(medicines);
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