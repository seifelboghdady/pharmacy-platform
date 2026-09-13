const Joi = require("joi");

const createOrderSchema = Joi.object({
    supplier: Joi.string().trim().required(),
    status: Joi.string().valid("pending", "received", "cancelled")
        .default("pending"),
    orderDate: Joi.date(),
    generatedAutomatically: Joi.boolean().default(false),
    items: Joi.array().items(Joi.object({
        medicineName: Joi.string().trim().required(),
        barcode: Joi.string().trim().required(),
        quantity: Joi.number().integer().min(1).required()
        })
    ).min(1).required()

});

const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid("pending", "received", "cancelled")
    .required()
});

module.exports = {
  createOrderSchema,
  updateOrderStatusSchema
};