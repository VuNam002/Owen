const express = require("express");
const router = express.Router();
const { requireAuth } = require("../../middlewares/auth.middleware");
const controller = require("../../controllers/comment.controlles");

router.get("/", controller.index);
router.post("/create", requireAuth, controller.create);
router.get("/detail/:id", controller.detail);
router.delete("/delete/:id", controller.delete);
router.patch("/change-status/:status/:id", controller.changeStatus)



module.exports = router;