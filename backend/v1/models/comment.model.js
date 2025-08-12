const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    article_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Article",
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    // user_id: { type: mongoose.Schema.Types.ObjectId, ref: "Account" }, // Sẽ dùng khi có chức năng đăng nhập
    fullName: String,
    email: String,
    content: String,
    parent_id: {
      type: String,
      default: "",
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Comment = mongoose.model("Comment", commentSchema, "comments");

module.exports = Comment;