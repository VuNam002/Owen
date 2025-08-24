const express = require("express");
const router = express.Router();

const controller = require("../../controllers/auth.controllers")
const authMiddleware = require("../../../middlewares/auth.middlewares"); // Assuming you have an auth middleware

router.post("/register", controller.register);
router.post("/login", controller.login);
router.get("/logout", controller.logout);
router.get("/me", authMiddleware.requireAuth, controller.getMe); // Add this line

module.exports = router;