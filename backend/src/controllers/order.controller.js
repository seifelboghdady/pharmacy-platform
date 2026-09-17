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
          pharmacy: req.user.pharmacyId,
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
    const orders = await Order.find({
      pharmacy: req.user.pharmacyId
    })
      .populate("createdBy", "name email");

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
      pharmacy: req.user.pharmacyId,
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

    const order = await Order.create({
      pharmacy: req.user.pharmacyId,
      supplier: null,
      createdBy: req.user.userId,
      generatedAutomatically: true,
      items
    });

    await MissingMedicine.updateMany(
      {
        pharmacy: req.user.pharmacyId,
        status: "pending"
      },
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

    const order = await Order.findOne({
      _id: req.params.id,
      pharmacy: req.user.pharmacyId
    });

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

    // Supplier is required only when receiving the order
    if (value.status === "received") {
      // if (!value.supplier || !value.supplier.trim()) {
      //   return res.status(400).json({
      //     message: "Supplier is required when receiving the order"
      //   });
      // }

      for (const item of order.items) {
        const medicine = await Medicine.findOne({
          barcode: item.barcode,
          pharmacy: req.user.pharmacyId
        });

        if (medicine) {
          medicine.stockQuantity += item.quantity;
          await medicine.save();
        }
      }

      await MissingMedicine.updateMany(
        {
          order: order._id,
          pharmacy: req.user.pharmacyId
        },
        {
          status: "fulfilled"
        }
      );

      // Save supplier only if Flutter sends it
      if (value.supplier && value.supplier.trim()) {
        order.supplier = value.supplier.trim();
      }
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
    const order = await Order.findOne({
      _id: req.params.id,
      pharmacy: req.user.pharmacyId
    })
      .populate("createdBy", "name email");

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