const Order = require("../models/Order");
const MissingMedicine = require("../models/MissingMedicine");
const Medicine = require("../models/Medicine");
const { createOrderSchema, updateOrderStatusSchema } = require("../validations/order.validation");

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

    const groupedMedicines = {};

    for (const missingMedicine of missingMedicines) {
      if (!groupedMedicines[missingMedicine.barcode]) {
        groupedMedicines[missingMedicine.barcode] = {
          medicineName: missingMedicine.medicineName,
          barcode: missingMedicine.barcode,
          quantity: 0
        };
      }

      groupedMedicines[missingMedicine.barcode].quantity +=
        missingMedicine.requiredQuantity;
    }

    const items = Object.values(groupedMedicines);

    // const items = [];

    // for (const missingMedicine of missingMedicines) {
    //   const medicine = await Medicine.findOne({
    //     barcode: missingMedicine.barcode
    //   });

    //   if (!medicine) {
    //     return res.status(404).json({
    //       message: `Medicine with barcode ${missingMedicine.barcode} not found`
    //     });
    //   }

    //   items.push({
    //     medicine: medicine._id,
    //     quantity: missingMedicine.requiredQuantity
    //   });
    // }


    const order = await Order.create({
      supplier: "Unknown",
      createdBy: req.user.userId,
      generatedAutomatically: true,
      items
    });

    await MissingMedicine.updateMany(
      { status: "pending" },
      {
        status: "ordered",
        order: order._id
      }
    );

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

const updateOrderStatus = async (req, res) => {
  try {
    const { error, value } = updateOrderStatusSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: error.details[0].message
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    if (order.status === "received") {
      return res.status(400).json({
        message: "Order has already been received"
      });
    }

    if (value.status === "received") {
      for (const item of order.items) {
        const medicine = await Medicine.findOne({
          barcode: item.barcode
        });

        if (medicine) {
          medicine.stockQuantity += item.quantity;
          await medicine.save();
        }
      }

      await MissingMedicine.updateMany(
        { order: order._id },
        { status: "fulfilled" }
      );
    }

    order.status = value.status;

    await order.save();

    return res.status(200).json({
      message: "Order status updated successfully",
      order
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Something went wrong"
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    return res.status(200).json(order);
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
  generateOrderFromMissingMedicines,
  updateOrderStatus,
  getOrderById
};