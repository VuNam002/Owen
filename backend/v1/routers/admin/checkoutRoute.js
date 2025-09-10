const express = require('express');
const router = express.Router();
const controller = require("../../controllers/checkout.controllers");


router.get("/", controller.index);
router.post("/order", controller.order);
router.get("/success/:orderId", controller.success);
router.patch("/change-status/:status/:id", controller.changeStatus);


module.exports = router;