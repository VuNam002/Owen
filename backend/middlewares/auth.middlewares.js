const Account = require("../v1/models/account.models"); 
const Role = require("../v1/models/role.models");      
const jwt = require("jsonwebtoken"); // Import jsonwebtoken

module.exports.requireAuth = async (req, res, next) => {
  if (!req.cookies.token) {
    console.log("Middleware: No token in cookies.");
    return res.status(401).json({ message: "No token provided. Authentication required." });
  }

  const token = req.cookies.token;
  console.log("Middleware: Received token:", token);
  console.log("Middleware: JWT Secret:", process.env.JWT_SECRET); // Be careful with this in production

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Use jwt.verify
    const userId = decoded.id; // Get user ID from decoded token
    console.log("Middleware: Decoded userId:", userId);

    const user = await Account.findById(userId).select("-password"); // Find user by ID
    console.log("Middleware: User found:", !!user);
    if (!user) {
      return res.status(401).json({ message: "Invalid token." });
    }
    console.log("Middleware: User role_id:", user.role_id);
    const role = user.role_id;
    console.log("Middleware: Role found:", !!role);

    req.user = {
      id: user._id,
      username: user.fullName,
      email: user.email,
      role: {
        _id: role._id,
        name: role.title,
        permissions: role.permissions
      }
    };

    next();
  } catch (error) {
    console.error("JWT Verification Error:", error); // Log JWT specific errors
    if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: "Token expired. Please log in again." });
    }
    if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: "Invalid token. Please log in again." });
    }
    return res.status(500).json({ message: "Authentication failed due to server error.", error: error.message });
  }
};
