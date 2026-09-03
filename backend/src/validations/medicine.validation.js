const Joi = require("joi");

const createMedicineSchema = Joi.object({
    name: Joi.string().trim().required(),
    barcode: Joi.string().trim().required(),
    manufacturer: Joi.string().trim().required(),
    category: Joi.string().trim().required(),
    price: Joi.number().min(0).required(),
    stockQuantity: Joi.number().integer().min(0).required(),
    expiryDate: Joi.date().required(),
    supplier: Joi.string().trim().required(),
    unit: Joi.string().trim().required(),
});

const updateMedicineSchema = Joi.object({
  name: Joi.string().trim(),
  barcode: Joi.string().trim(),
  manufacturer: Joi.string().trim(),
  category: Joi.string().trim(),
  unit: Joi.string().trim(),
  price: Joi.number().min(0),
  stockQuantity: Joi.number().integer().min(0),
  expiryDate: Joi.date(),
  supplier: Joi.string().trim()
});

module.exports={
    createMedicineSchema,
    updateMedicineSchema
}