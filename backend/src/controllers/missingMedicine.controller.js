const MissingMedicine = require("../models/MissingMedicine");
const {createMissingMedicineSchema} = require("../validations/missingMedicine.validation");

const createMissingMedicine = async (req, res) => {
  try {
    const { error, value } = createMissingMedicineSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: error.details[0].message
      });
    }

    const missingMedicine = await MissingMedicine.create(value);

    return res.status(201).json(missingMedicine);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Something went wrong"
    });
  }
};

const getMissingMedicines = async (req, res) => {
  try {
    const missingMedicines = await MissingMedicine.find({
      status: "pending"
    });

    return res.status(200).json(missingMedicines);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Something went wrong"
    });
  }
};


module.exports = {
  createMissingMedicine,
  getMissingMedicines
};