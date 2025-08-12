import { createRequire } from "module";
const require = createRequire(import.meta.url);

const handleError = require("../../helpers/handleError");
const Account = require("../models/account.models");
const md5 = require("md5");
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Vui lòng nhập đầy đủ thông tin đăng nhập",
        });
    }

    try {
        const user = await Account.findOne({
            email: email.trim(),
            deleted: false,
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Email không tồn tại",
            });
        }

        if (user.status === "inactive") {
            return res.status(400).json({
                success: false,
                message: "Tài khoản đang bị khóa",
            });
        }

        const hashedPassword = md5(password);
        if (user.password !== hashedPassword) {
            return res.status(400).json({
                success: false,
                message: "Mật khẩu không chính xác",
            });
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        user.token = token;
        await user.save();

        const { password: _, ...userWithoutPassword } = user.toObject();

        res.status(200).json({
            success: true,
            message: "Đăng nhập thành công",
            data: userWithoutPassword,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Lỗi khi đăng nhập",
        });
    }
};

export const logout = (req, res) => {
    res.status(200).json({
        success: true,
        message: "Đăng xuất thành công"
    });
};

export const register = async (req, res) => {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "Vui lòng nhập đầy đủ thông tin đăng ký",
        });
    }

    try {
        const existingUser = await Account.findOne({ email: email.trim() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email đã tồn tại",
            });
        }

        const hashedPassword = md5(password);

        const newUser = new Account({
            fullName,
            email: email.trim(),
            password: hashedPassword,
        });

        await newUser.save();

        const token = jwt.sign(
            { id: newUser._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        newUser.token = token;
        await newUser.save();

        const { password: _, ...userWithoutPassword } = newUser.toObject();

        res.status(201).json({
            success: true,
            message: "Đăng ký thành công",
            data: userWithoutPassword,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Lỗi khi đăng ký tài khoản",
        });
    }
};
