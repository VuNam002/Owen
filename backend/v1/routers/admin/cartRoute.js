const express = require("express");
const router = express.Router();

const controller = require("../../controllers/cart.controllers")

router.post("/add/:productId", controller.addPost);
router.get("/", controller.index);
router.delete("/delete/:productId", controller.delete);
router.patch("/update/:productId/:quantity", controller.update)

module.exports = router;