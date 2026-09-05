const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { createUserSchema, loginUserSchema } = require("../validations/user.validation");

const createUser = async (req, res) => {
    try{
      const { error, value } = createUserSchema.validate(req.body);

      if (error) {
        return res.status(400).json({
            message: error.details[0].message
        });
      }
      const hashedPassword = await bcrypt.hash(value.password, 10);
      const user = await User.create({
        ...value,
        password: hashedPassword
        });
    
      return res.status(201).json({
        message: "User created successfully",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          pharmacyName: user.pharmacyName,
          phone: user.phone
        }
      });
    }catch(error){
        console.error(error);
        if (error.code === 11000) {
            return res.status(409).json({
            message: "Email already exists"
            });
        }
        return res.status(500).json({
        message: "Something went wrong"
        });
    }
};

const getUsers = async (req, res) => {
  const users = await User.find();

  res.json(users);
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const { error, value } = loginUserSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      message: error.details[0].message
    });
  }

  const user = await User.findOne({ email: value.email }).select("+password");
  if (!user) {
    return res.status(401).json({
      message: "Invalid email or password"
    });
  }

  const isPasswordValid = await bcrypt.compare(
    value.password,
    user.password
  );

  if (!isPasswordValid) {
    return res.status(401).json({
      message: "Invalid email or password"
    });
  }

  const token = jwt.sign(
    {
      userId: user._id,
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d"
    }
  );

  return res.status(200).json({
    message: "Login successful",
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      pharmacyName: user.pharmacyName,
      phone: user.phone
    }
  });
};

const registerOwner = async (req, res) => {
  try {
    const { error, value } = createUserSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: error.details[0].message
      });
    }

    if (value.role !== "owner") {
      return res.status(403).json({
        message: "Only owner registration is allowed"
      });
    }

    const hashedPassword = await bcrypt.hash(value.password, 10);

    const user = await User.create({
      ...value,
      password: hashedPassword
    });

    return res.status(201).json({
      message: "Owner registered successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        pharmacyName: user.pharmacyName,
        phone: user.phone
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email already exists"
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Something went wrong"
    });
  }
};

module.exports = {
  createUser,
  getUsers,
  loginUser,
  registerOwner
};