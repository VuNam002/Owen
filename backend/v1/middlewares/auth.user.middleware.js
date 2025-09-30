const Account = require("../models/account.models"); 
const jwt = require("jsonwebtoken");

module.exports.requireUserAuth = async (req, res, next) => {
  if (!req.cookies.token) {
    return res.status(401).json({ message: "Vui lòng đăng nhập để thực hiện chức năng này." });
  }

  const token = req.cookies.token;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const user = await Account.findById(userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Token không hợp lệ." });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("JWT Verification Error:", error);
    if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: "Token đã hết hạn. Vui lòng đăng nhập lại." });
    }
    if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: "Token không hợp lệ. Vui lòng đăng nhập lại." });
    }
    return res.status(500).json({ message: "Lỗi xác thực máy chủ.", error: error.message });
  }
};
