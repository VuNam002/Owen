const express = require("express");
const router = express.Router();
const controllers = require("../../controllers/roles.controllers")

router.get("/", controllers.index)
router.post("/create", controllers.create);
router.patch("/edit/:id", controllers.edit);
router.delete("/delete/:id", controllers.deleted)
router.patch("/change-status/:status/:id", controllers.changeStatus);
router.get("/detail/:id", controllers.detail);
router.patch("/permissions", controllers.permissions)

module.exports = router;