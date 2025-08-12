const express = require('express')
const router = express.Router()

const controller = require("../../controllers/productCategory.controllers");

router.get("/", controller.index);
router.post("/create", controller.create);
router.patch("/change-status/:status/:id", controller.changeStatus);
router.patch("/edit/:id", controller.edit)
router.get("/detail/:id", controller.detail)
router.delete("/delete/:id", controller.delete)


module.exports = router;
