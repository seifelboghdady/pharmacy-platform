const express = require("express");
const {createMedicine, getMedicines, getMedicineById, updateMedicine, deleteMedicine} = require("../controllers/medicine.controller");
const {authMiddleware} = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");


const router = express.Router();

router.post("/", authMiddleware, roleMiddleware(["owner"]), createMedicine);
router.get("/", authMiddleware, getMedicines);
router.get("/:id", authMiddleware, getMedicineById);
router.patch("/:id", authMiddleware, roleMiddleware(["owner"]), updateMedicine);
router.delete("/:id", authMiddleware, roleMiddleware(["owner"]), deleteMedicine);

module.exports = router;