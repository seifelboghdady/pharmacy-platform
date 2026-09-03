const express = require("express");
const {createOrder} = require("../controllers/order.controller");
const {authMiddleware} = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const router = express.Router();

router.post("/",authMiddleware,roleMiddleware(["owner"]),createOrder);

module.exports = router;