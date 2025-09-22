const jwt = require('jsonwebtoken');
const User = require('../models/user.models');

// Middleware kiểm tra xem người dùng đã đăng nhập chưa (xác thực token)
const requireAuth = async (req, res, next) => {
  let token;

  // Token thường được gửi trong header Authorization theo format 'Bearer <token>'
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 1. Lấy token từ header
      token = req.headers.authorization.split(' ')[1];

      // 2. Giải mã token để lấy id người dùng
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Tìm người dùng trong DB và gán vào request (trừ mật khẩu)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Người dùng không tồn tại' });
      }

      next(); // Chuyển sang middleware hoặc controller tiếp theo
    } catch (error) {
      console.error(error);
      return res.status(401).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Không tìm thấy token, yêu cầu bị từ chối' });
  }
};

// Middleware kiểm tra quyền admin
const isAdmin = (req, res, next) => {
  // Middleware này phải chạy SAU requireAuth
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Yêu cầu quyền Admin' });
  }
};

module.exports = {
  requireAuth,
  isAdmin,
};
