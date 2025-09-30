const mongoose = require("mongoose");
const { generateRandomString } = require("../../helpers/generate");

const userSchema = new mongoose.Schema(
  {
    fullName: String,
    email: String,
    password: String,
    tokenUser: {
        type: String,
        default: generateRandomString(20)
    },
    phone: String,
    avatar: String,
    status: {
        type: String,
        default: "active"
    },
    deleted: {
        type: Boolean,
        default: false,
    },
    deletedAt: Date,
    updateBy: String,
    updateAt: Date
  },
  {
    timestamps: true
  }
);

const User = mongoose.model("User", userSchema, "users");

module.exports = User;
