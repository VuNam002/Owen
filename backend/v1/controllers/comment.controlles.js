const Comment = require("../models/comment.model");
const User = require("../models/user.models");
const handleError = require("../../helpers/handleError");
const Product = require("../models/productmodel");
const paginationHelper = require("../../helpers/pagination");
const buildSortObject = require("../../helpers/buildSortObject");

module.exports. index = async (req, res) => {
  try {
    const find = {
      deleted: false,
    };
    if (req.query.product_id) {
      find.product_id = req.query.product_id;
    }
    if (req.query.article_id) {
      find.article_id = req.query.article_id;
    }
    if (req.query.keyword) {
      const keyword = new RegExp(req.query.keyword, "i");
      find.$or = [
        { fullName: keyword },
        { email: keyword },
        { content: keyword },
      ];
    }

    const sort = buildSortObject(req);
    const countRecords = await Comment.countDocuments(find);
    const pagination = paginationHelper(
      { limitItems: req.query.limit || 10 },
      req.query,
      countRecords
    );
    const comments = await Comment.find(find)
      .populate("product_id", "title thumbnail")
      .populate("article_id", "title thumbnail")
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limitItems);
    if (comments.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Không tìm thấy bình luận nào",
        data: [],
        pagination,
      });
    }
    res.status(200).json({
      success: true,
      message: "Lấy danh sách bình luận thành công",
      data: comments,
      pagination,
    });
  } catch (error) {
    handleError(res, error, "Lỗi khi lấy danh sách bình luận");
  }
};
module.exports.create = async (req, res) => {
  try {
    const { content, product_id, article_id } = req.body;

    // console.log('req.user:', req.user);
    // console.log('req.user.fullName:', req.user?.fullName)

    // Validation
    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Nội dung bình luận không được để trống'
      });
    }

    if (!product_id && !article_id) {
      return res.status(400).json({
        success: false,
        message: 'Cần cung cấp product_id hoặc article_id'
      });
    }

    // Kiểm tra sản phẩm/bài viết có tồn tại không
    if (product_id) {
      const productExists = await Product.findById(product_id);
      if (!productExists) {
        return res.status(404).json({
          success: false,
          message: 'Sản phẩm không tồn tại'
        });
      }
    }

      const newComment = new Comment({
      content: content.trim(),
      product_id: product_id || null,
      article_id: article_id || null,
      user_id: req.user._id, 
      fullName: req.user.fullName || req.user.email, 
      email: req.user.email, 
      deleted: false
    });

    await newComment.save();

    res.status(201).json({
      success: true,
      message: 'Thêm bình luận thành công',
      data: newComment
    });
  } catch (error) {
    handleError(res, error, 'Lỗi khi tạo bình luận');
  }
};

