const express = require("express");

const {registerOwner} = require("../controllers/user.controller");

const router = express.Router();

router.post("/register", registerOwner);

module.exports = router;