const express = require('express');
const router = express.Router();
const controller = require("../../controllers/checkout.controllers");

// GET /api/v1/checkout - Lấy thông tin giỏ hàng để checkout
router.get("/", controller.index);

// POST /api/v1/checkout/order - Tạo đơn hàng mới
router.post("/order", controller.order);

// GET /api/v1/checkout/success/:orderId - Lấy thông tin đơn hàng sau khi thành công
router.get("/success/:orderId", controller.success);

module.exports = router;