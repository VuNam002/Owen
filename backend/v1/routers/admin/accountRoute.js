const express = require("express");
const router = express.Router();

const controller = require("../../controllers/account.controlles");

router.get("/", controller.index);
router.post("/create", controller.create);
router.patch("/edit/:id", controller.edit);
router.get("/detail/:id", controller.detail);
router.delete("/deletd/:id", controller.delete);
router.patch("/change-status/:status/:id", controller.changeStatus);

module.exports = router;