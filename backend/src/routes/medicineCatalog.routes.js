const express = require("express");

const {createMedicineCatalog,getMedicineCatalog,getMedicineCatalogById} = require("../controllers/medicineCatalog.controller");

const {authMiddleware} = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

const router = express.Router();

// Owner only
router.post("/",authMiddleware,roleMiddleware(["owner"]),createMedicineCatalog);

// Owner + Employee
router.get("/",authMiddleware,roleMiddleware(["owner", "employee"]),getMedicineCatalog);
router.get("/:id",authMiddleware,roleMiddleware(["owner", "employee"]),getMedicineCatalogById);

module.exports = router;