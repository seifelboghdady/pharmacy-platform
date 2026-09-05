const express = require("express");
const {createDispensingTransaction, getDispensingTransactions} = require("../controllers/dispensingTransaction.controller");
const {authMiddleware} = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

const router = express.Router();

router.post("/",authMiddleware,roleMiddleware(["owner", "employee"]),createDispensingTransaction);
router.get("/",authMiddleware,getDispensingTransactions);

module.exports = router;