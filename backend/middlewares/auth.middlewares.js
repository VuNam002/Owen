const Account = require("../v1/models/account.models"); 
const Role = require("../v1/models/role.models");      

module.exports.requireAuth = async (req, res, next) => {
  if (!req.cookies.token) {
    return res.status(401).json({ message: "No token provided. Authentication required." });
  }

  try {
    const user = await Account.findOne({ token: req.cookies.token }).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Invalid token." });
    }
    const role = await Role.findById(user.role_id).select("title permissions");

    res.locals.user = {
      ...user.toObject(),
      role: role.toObject()
    };

    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Authentication failed due to server error.", error: error.message });
  }
};
