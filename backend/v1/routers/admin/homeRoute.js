const express = require("express")
const router = express.Router()

const controller = require("../../controllers/home.controlles")

router.get("/", controller.index);

module.exports = router;