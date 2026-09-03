const Order = require("../models/Order");
const { createOrderSchema } = require("../validations/order.validation");

const createOrder = async (req, res) => {
    try{

        const { error, value } = createOrderSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                message: error.details[0].message
            });
        }
        const order = await Order.create({
            ...value,
            createdBy: req.user.userId
        });
        return res.status(201).json(order);
    }catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Something went wrong"
    });
  }
};

module.exports = {
  createOrder
};