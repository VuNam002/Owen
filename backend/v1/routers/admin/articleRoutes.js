const express = require("express");
const router = express.Router();

const controller = require("../../controllers/article.controllers");

router.get("/", controller.index);
router.patch("/edit/:id", controller.edit);
router.post("/create", controller.create)
router.get("/detail/:id", controller.detail)
router.delete("/delete/:id", controller.delete);
router.patch("/change-status/:status/:id", controller.changeStatus);

module.exports = router;