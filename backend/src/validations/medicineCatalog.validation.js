const Joi = require("joi");

const createMedicineCatalogSchema = Joi.object({
  name: Joi.string().trim().required(),

  barcode: Joi.string().trim().required(),

  activeIngredient: Joi.string().trim().allow(""),

  manufacturer: Joi.string().trim().allow(""),

  category: Joi.string().trim().allow(""),

  dosageForm: Joi.string().trim().allow(""),

  strength: Joi.string().trim().allow("")
});

module.exports = {
  createMedicineCatalogSchema
};