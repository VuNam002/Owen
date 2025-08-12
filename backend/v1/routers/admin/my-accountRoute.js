const express = require("express");
const router = express.Router();

// Import the middleware
const authMiddleware = require("../../../middlewares/auth.middlewares");

const controller = require("../../controllers/myAccount.controlles");

// Use the middleware for all routes in this file
// Now, any request to /my-account/... will require authentication first.
router.use(authMiddleware.requireAuth);

router.get("/", controller.index);

router.patch("/edit/:id", controller.edit);

module.exports = router;