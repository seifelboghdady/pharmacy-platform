const Order = require("../models/Order");
const MissingMedicine = require("../models/MissingMedicine");
const Medicine = require("../models/Medicine");
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

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find();

    return res.status(200).json(orders);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Something went wrong"
    });
  }
};

const generateOrderFromMissingMedicines = async (req, res) => {
  try {
    const missingMedicines = await MissingMedicine.find({
      status: "pending"
    });

    if (missingMedicines.length === 0) {
      return res.status(404).json({
        message: "No pending missing medicines found"
      });
    }

    const items = [];

    for (const missingMedicine of missingMedicines) {
      const medicine = await Medicine.findOne({
        barcode: missingMedicine.barcode
      });

      if (!medicine) {
        return res.status(404).json({
          message: `Medicine with barcode ${missingMedicine.barcode} not found`
        });
      }

      items.push({
        medicine: medicine._id,
        quantity: missingMedicine.requiredQuantity
      });
    }

    const order = await Order.create({
      supplier: "ABC Pharma",
      createdBy: req.user.userId,
      generatedAutomatically: true,
      items
    });

    return res.status(201).json({
      message: "Order created successfully",
      order
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Something went wrong"
    });
  }
};

module.exports = {
  createOrder,
  getOrders,
  generateOrderFromMissingMedicines
};