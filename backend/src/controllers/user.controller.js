const User = require("../models/User");
const { createUserSchema } = require("../validations/user.validation");
const bcrypt = require("bcrypt");

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
    
      res.status(201).json(user);
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

module.exports = {
  createUser,
  getUsers
};