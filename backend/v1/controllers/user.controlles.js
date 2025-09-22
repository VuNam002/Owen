const User = require('../models/user.models'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ForgotPassword = require("../models/forgot-password")

// Đăng ký
//POST /api/v1/users/register
module.exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email đã tồn tại' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email, password: hashedPassword });

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Đăng nhập
// POST /api/v1/users/login
module.exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng' });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,

      },
    });
  } catch (error) {
    next(error);
  }
};

const generateHelper = require('../../helpers/generate');
const sendMailHelper = require('../../helpers/sendMail');

//Lấy lại mật khẩu
//POST /api/v1/users/forgot-password
module.exports.forgotPassword = async (req, res) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({
      email: email,
      deleted: false
    });
    if(!user) {
      return res.status(404).json({
        success: false,
        message: "Email không tồn tại"
      })
    }
    const otp = generateHelper.generateRandomNumber(6);
    const objectForgotPassword = {
      email: email,
      otp: otp,
      expiresAt: Date.now() + 3 * 60 * 1000 // Tồn tại trong 3 phút
    }
    const forgotPassword = new ForgotPassword(objectForgotPassword);
    await forgotPassword.save();

    const subject = `Mã OTP xác minh lấy lại mật khẩu`;
    const html=`
      Mã OTP để lấy lại mật khẩu của bạn là: <b>${otp}</b>. Mã OTP có hiệu lực trong 3 phút.
    `
    sendMailHelper.sendMail(email,subject,html);

    res.status(200).json({
      success: true,
      message: "Mã OTP đã được gửi vào email của bạn"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra, vui lòng thử lại"
    })
  }
}

//Xác thực OTP
//POST /api/v1/users/otp-password
module.exports.otpPassword = async (req, res) => {
  try {
    const email = req.body.email;
    const otp = req.body.otp;

    const result = await ForgotPassword.findOne({
      email: email,
      otp: otp,
    });
    if(!result) {
      return res.status(400).json({
        success: false,
        message: "Mã OTP không đúng"
      })
    }

    if(Date.now() > result.expiresAt) {
      return res.status(400).json({
        success: false,
        message: "Mã OTP đã hết hạn"
      })
    }

    const user = await User.findOne({
      email: email,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '15m',
    });

    res.cookie("resetToken", token);

    res.status(200).json({
      success: true,
      message: "Xác thực thành công, bạn có thể đổi mật khẩu",
      token: token
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra, vui lòng thử lại"
    })
  }
}

// Đặt lại mật khẩu
// POST /api/v1/users/reset-password
module.exports.resetPassword = async (req, res) => {
  try {
    const resetToken = req.cookies.resetToken;
    const { password } = req.body;

    if(!resetToken) {
      return res.status(400).json({
        success: false,
        message: "Không tìm thấy token"
      })
    }

    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if(!user) {
      return res.status(404).json({
        success: false,
        message: "Người dùng không tồn tại"
      })
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.updateOne({
      _id: user._id
    }, {
      password: hashedPassword
    });

    res.clearCookie("resetToken");

    res.status(200).json({
      success: true,
      message: "Đổi mật khẩu thành công"
    })

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Token không hợp lệ' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token đã hết hạn' });
    }
    res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra, vui lòng thử lại"
    })
  }
}


//Lấy thông tin cá nhân
// GET /api/v1/users/profile
module.exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

//Đăng xuất
//GET /api/v1/users/logout

module.exports.logout = (req, res, next) => {
  res.status(200).json({ success: true, message: 'Đăng xuất thành công' });
};

// CHỨC NĂNG ADMIN
// @route   GET /api/v1/admin/users
module.exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    console.log(User);
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/v1/admin/users/:id
module.exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Cập nhật người dùng
// @route   PUT /api/v1/admin/users/:id
// @access  Private (Admin)
module.exports.updateUser = async (req, res, next) => {
  try {
    const { password, ...updateData } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }
    res.status(200).json({ success: true, message: 'Cập nhật thành công', data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Xóa người dùng
// @route   DELETE /api/v1/admin/users/:id
module.exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }
    res.status(200).json({ success: true, message: 'Xóa người dùng thành công' });
  } catch (error) {
    next(error);
  }
};
