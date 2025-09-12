const express = require("express")
const router = express.Router()

const controller = require("../../controllers/home.controlles")

router.get("/", controller.index);
router.get("/brand/:brand", controller.getByBrand);
router.get("/brands", controller.getAllBrands);
router.get("/category/:categoryId", controller.getByCategory);

module.exports = router;