const express = require("express");

const {createMissingMedicine, getMissingMedicines} = require("../controllers/missingMedicine.controller");

const {authMiddleware} = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

const router = express.Router();

router.post("/",authMiddleware,roleMiddleware(["owner", "employee"]),createMissingMedicine);
router.get( "/",authMiddleware,roleMiddleware(["owner", "employee"]),getMissingMedicines);


module.exports = router;