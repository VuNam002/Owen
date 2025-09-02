const express = require("express");
const router = express.Router();

const controller = require("../../controllers/product.controllers");

router.get("/", controller.index);
router.patch("/change-status/:status/:id", controller.changeStatus);
router.patch("/change-position", controller.changePosition);
router.post("/create", controller.create);
router.patch("/edit/:id", controller.edit);
router.delete("/delete/:id", controller.delete);
router.get("/detail/:id", controller.detail)
router.patch("/create-comment/:id", controller.createComment);



module.exports = router;