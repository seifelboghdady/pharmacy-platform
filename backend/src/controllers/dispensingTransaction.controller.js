const mongoose = require("mongoose");
const DispensingTransaction = require("../models/DispensingTransaction");
const Medicine = require("../models/Medicine");
const {createDispensingTransactionSchema} = require("../validations/dispensingTransaction.validation");

const createDispensingTransaction = async (req, res) => {
  let session;

  try {
    const { error, value } =
      createDispensingTransactionSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: error.details[0].message
      });
    }

    session = await mongoose.startSession();
    session.startTransaction();

    const medicine = await Medicine.findById(value.medicine).session(session);

    if (!medicine) {
      await session.abortTransaction();

      return res.status(404).json({
        message: "Medicine not found"
      });
    }

    if (medicine.stockQuantity < value.quantity) {
      await session.abortTransaction();

      return res.status(400).json({
        message: "Insufficient stock"
      });
    }

    const totalPrice = medicine.price * value.quantity;

    const transaction = await DispensingTransaction.create(
      [
        {
          medicine: medicine._id,
          quantity: value.quantity,
          totalPrice,
          dispensedBy: req.user.userId
        }
      ],
      { session }
    );

    medicine.stockQuantity -= value.quantity;

    await medicine.save({ session });

    await session.commitTransaction();

    return res.status(201).json({
      message: "Medicine dispensed successfully",
      transaction: transaction[0]
    });
  } catch (error) {
    if (session) {
      await session.abortTransaction();
    }

    console.error(error);

    return res.status(500).json({
      message: "Something went wrong"
    });
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};
const getDispensingTransactions = async (req, res) => {
  try {
    const transactions = await DispensingTransaction.find()
      .populate("medicine", "name barcode price")
      .populate("dispensedBy", "name email");

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
    const transaction = await DispensingTransaction.findById(req.params.id)
      .populate("medicine", "name barcode price")
      .populate("dispensedBy", "name email");

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