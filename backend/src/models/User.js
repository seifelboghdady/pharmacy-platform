const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  role: {
  type: String,
  required: true,
  enum: ["owner", "employee"]
  },
  pharmacyName:{
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  pharmacyOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  }

},{timestamps: true});

module.exports = mongoose.model("User", userSchema);