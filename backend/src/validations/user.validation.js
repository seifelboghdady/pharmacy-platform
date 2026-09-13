const Joi = require("joi");

const createUserSchema = Joi.object({
  name: Joi.string().trim().required(),
  email: Joi.string().email().trim().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string()
  .valid("owner", "employee")
  .required(),
  pharmacyName: Joi.string().trim().required(),
  phone: Joi.string().trim().required()
});

const loginUserSchema = Joi.object({
  email: Joi.string().email().trim().required(),
  password: Joi.string().required()
});

module.exports = {
  createUserSchema,
  loginUserSchema
};