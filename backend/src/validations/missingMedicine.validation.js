const Joi = require("joi");

const createMissingMedicineSchema = Joi.object({
  medicineName: Joi.string().trim().required(),

  barcode: Joi.string().trim().required(),

  requiredQuantity: Joi.number()
    .integer()
    .min(1)
    .required(),

  status: Joi.string()
    .valid("pending", "fulfilled", "cancelled")
    .default("pending"),

  notes: Joi.string().trim()
});

module.exports = {
    createMissingMedicineSchema
}