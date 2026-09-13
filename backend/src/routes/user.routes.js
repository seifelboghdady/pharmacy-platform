const express = require("express");
const { createUser, getUsers, loginUser} = require("../controllers/user.controller");
const {authMiddleware} = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

const router = express.Router();

router.post("/", authMiddleware, roleMiddleware(["owner"]), createUser);
router.get("/", authMiddleware, roleMiddleware(["owner"]) ,getUsers);
router.post("/login", loginUser);

module.exports = router;