const express = require("express");
const router = express.Router();

const controllers = require("../../controllers/user.controlles")

router.post("/register", controllers.register);
router.post("/login", controllers.login);
router.get("/profile", controllers.getProfile)// lấy thông tin cá nhân
router.get("/logout", controllers.logout);
router.post("/forgot-password", controllers.forgotPassword);
router.post("/otp-password", controllers.otpPassword);
router.post("/reset-password", controllers.resetPassword);


//Bên Admin
router.get("/", controllers.getAllUsers); //Lấy tất cả người dùng
router.get("/detail/:id", controllers.getUserById); //Lấy chi tiết người dùng
router.patch("/edit/:id", controllers.updateUser); //Cập nhật người dùng
router.delete("/deleted/:id", controllers.deleteUser); //Xóa người dùng

module.exports = router;