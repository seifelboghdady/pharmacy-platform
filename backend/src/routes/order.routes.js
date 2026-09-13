const express = require("express");
const {createOrder, getOrders, generateOrderFromMissingMedicines, updateOrderStatus, getOrderById} = require("../controllers/order.controller");
const {authMiddleware} = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const router = express.Router();

router.post("/",authMiddleware,roleMiddleware(["owner"]),createOrder);
router.get("/",authMiddleware,getOrders);
router.post("/generate-from-missing",authMiddleware,roleMiddleware(["owner"]),generateOrderFromMissingMedicines);
router.patch("/:id/status",authMiddleware,roleMiddleware(["owner"]),updateOrderStatus);
router.get("/:id",authMiddleware,getOrderById);

module.exports = router;