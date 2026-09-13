const MedicineCatalog = require("../models/MedicineCatalog");
const {createMedicineCatalogSchema} = require("../validations/medicineCatalog.validation");
const { getCache, setCache, deleteCacheByPattern } = require("../utils/cache");
const { medicineCatalogKey } = require("../utils/cacheKeys");

const createMedicineCatalog = async (req, res) => {
  try {
    const { error, value } = createMedicineCatalogSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: error.details[0].message
      });
    }

    const medicine = await MedicineCatalog.create(value);
    await deleteCacheByPattern("medicine-catalog:*");
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
    const cacheKey = medicineCatalogKey(req.query);

    // Check Redis first
    const cachedMedicines = await getCache(cacheKey);

    if (cachedMedicines) {
      return res.status(200).json(cachedMedicines);
    }

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

    // Save result in Redis for 5 minutes
    await setCache(cacheKey, medicines, 300);

    return res.status(200).json(medicines);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

const getMedicineCatalogById = async (req, res) => {
  try {
    const cacheKey = `medicine-catalog:id:${req.params.id}`;

    // Check Redis first
    const cachedMedicine = await getCache(cacheKey);

    if (cachedMedicine) {
      return res.status(200).json(cachedMedicine);
    }

    // Cache miss → MongoDB
    const medicine = await MedicineCatalog.findById(req.params.id);

    if (!medicine) {
      return res.status(404).json({
        message: "Medicine not found in catalog"
      });
    }

    // Save in Redis for 5 minutes
    await setCache(cacheKey, medicine, 300);

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