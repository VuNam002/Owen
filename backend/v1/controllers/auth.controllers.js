import { createRequire } from "module";
const require = createRequire(import.meta.url);

const handleError = require("../../helpers/handleError");
const Account = require("../models/account.models");
const md5 = require("md5");
import jwt from "jsonwebtoken";
const Role = require("../models/role.models");


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

        // Populate the role_id field before sending the user data
        await user.populate({
            path: "role_id",
            select: "title permissions"
        });

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Set the token as an HTTP-only cookie
        res.cookie('token', token, {
            httpOnly: true, // Makes the cookie inaccessible to client-side scripts
            secure: process.env.NODE_ENV === 'production', // Send cookie only over HTTPS in production
            maxAge: 3600000, // 1 hour in milliseconds (matches token expiry)
            sameSite: 'Lax', // Protects against CSRF attacks
        });

        // user.token is not needed if token is only in cookie
        // user.token = token;
        // await user.save();

        const { password: _, ...userWithoutPassword } = user.toObject();

        // Manually add the populated role to userWithoutPassword
        userWithoutPassword.role = user.role_id;

        res.status(200).json({
            success: true,
            message: "Đăng nhập thành công",
            data: userWithoutPassword, // Now this should include the populated role_id
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

export const getMe = async (req, res) => {
    try {
        const user = await Account.findById(req.user.id)
            .select("-password")
            .populate({
                path: "role_id", // Changed from "role" to "role_id"
                select: "title permissions" 
            });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        const userWithPermissions = {
            id: user._id,
            username: user.fullName, 
            email: user.email,
            role: {
                _id: user.role_id._id,
                name: user.role_id.title,
                permissions: user.role_id.permissions
            }
        };

        // Disable caching for this response
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');
        res.set('ETag', ''); // Remove ETag
        res.set('Last-Modified', ''); // Remove Last-Modified

        res.status(200).json({ success: true, user: userWithPermissions });
    } catch (error) {
        console.error("Error in getMe:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
