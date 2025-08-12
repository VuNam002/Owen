const express = require("express");
const router = express.Router();

const controllers = require("../../controllers/articleCategory.controllers");

router.get("/", controllers.index);
router.post("/create", controllers.create);
router.patch("/edit/:id", controllers.edit);
router.delete("/deleted/:id", controllers.delete);
router.patch("/change-status/:status/:id", controllers.changeStatus);
router.get("/detail/:id", controllers.detail)

module.exports = router;