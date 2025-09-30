const express = require("express");
const router = express.Router();
const { requireAuth } = require("../../middlewares/auth.middleware");
const controller = require("../../controllers/comment.controlles");

router.get("/", controller.index);
router.post("/create", requireAuth, controller.create);

module.exports = router;