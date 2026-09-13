const Joi = require("joi");

const createMedicineSchema = Joi.object({
    medicineCatalog: Joi.string().required(),
    price: Joi.number().min(0).required(),
    stockQuantity: Joi.number().integer().min(0).required(),
    expiryDate: Joi.date().required(),
    supplier: Joi.string().trim().required()
});

const updateMedicineSchema = Joi.object({
  medicineCatalog: Joi.string(),
  price: Joi.number().min(0),
  stockQuantity: Joi.number().integer().min(0),
  expiryDate: Joi.date(),
  supplier: Joi.string().trim()
});

module.exports={
    createMedicineSchema,
    updateMedicineSchema
}