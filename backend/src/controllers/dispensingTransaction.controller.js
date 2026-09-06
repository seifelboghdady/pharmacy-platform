const DispensingTransaction = require("../models/DispensingTransaction");
const Medicine = require("../models/Medicine");
const {createDispensingTransactionSchema} = require("../validations/dispensingTransaction.validation");

const createDispensingTransaction = async (req, res) => {
  try {
    const { error, value } =
      createDispensingTransactionSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: error.details[0].message
      });
    }

    const medicine = await Medicine.findById(value.medicine);

    if (!medicine) {
      return res.status(404).json({
        message: "Medicine not found"
      });
    }

    if (medicine.stockQuantity < value.quantity) {
      return res.status(400).json({
        message: "Insufficient stock"
      });
    }

    const totalPrice = medicine.price * value.quantity;

    const transaction = await DispensingTransaction.create({
      medicine: medicine._id,
      quantity: value.quantity,
      totalPrice,
      dispensedBy: req.user.userId
    });

    medicine.stockQuantity -= value.quantity;

    await medicine.save();

    await transaction.populate({
      path: "medicine",
      populate: {
        path: "medicineCatalog"
      }
    });

    await transaction.populate(
      "dispensedBy",
      "name email"
    );

    return res.status(201).json({
      message: "Medicine dispensed successfully",
      transaction
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Something went wrong"
    });
  }
};

const getDispensingTransactions = async (req, res) => {
  try {
    const transactions = await DispensingTransaction.find()
      .populate({
        path: "medicine",
        populate: {
          path: "medicineCatalog"
        }
      })
      .populate(
        "dispensedBy",
        "name email"
      );

    return res.status(200).json(transactions);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Something went wrong"
    });
  }
};

const getDispensingTransactionById = async (req, res) => {
  try {
    const transaction = await DispensingTransaction.findById(
      req.params.id
    )
      .populate({
        path: "medicine",
        populate: {
          path: "medicineCatalog"
        }
      })
      .populate(
        "dispensedBy",
        "name email"
      );

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found"
      });
    }

    return res.status(200).json(transaction);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Something went wrong"
    });
  }
};

module.exports = {
  createDispensingTransaction,
  getDispensingTransactions,
  getDispensingTransactionById
};