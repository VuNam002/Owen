const ArticleCategory = require("../models/article-category.models");
const Account = require("../models/account.models");
const handleError = require("../../helpers/handleError");

// Hàm tạo cây phân cấp
function createTree(arr, parentId = "") {
  const tree = [];
  arr.forEach((item) => {
    if (String(item.parent_id || "") === String(parentId)) {
      const newItem = { ...item };
      const children = createTree(arr, item._id);
      if (children.length > 0) {
        newItem.children = children;
      }
      tree.push(newItem);
    }
  });
  return tree;
}
module.exports.index = async (req, res) => {
  try {
    const find = { deleted: false };
    const recods = await ArticleCategory.find(find).lean();

    // Lấy danh sách accountId duy nhất từ createdBy
    const accountIds = recods
      .filter((item) => item.createdBy && item.createdBy.account_id)
      .map((item) => item.createdBy.account_id);

    const uniqueAccountIds = [...new Set(accountIds)];
    const users = await Account.find({ _id: { $in: uniqueAccountIds } })
      .select("fullName")
      .lean();

    const userMap = {};
    users.forEach((user) => {
      userMap[user._id.toString()] = user.fullName;
    });

    // Gắn tên người tạo vào từng bản ghi
    recods.forEach((article) => {
      if (article.createdBy && article.createdBy.account_id) {
        article.accountFullName =
          userMap[article.createdBy.account_id.toString()] || null;
      }
    });

    const tree = createTree(recods);

    res.status(200).json({
      success: true,
      message: "Lấy danh sách danh mục bài viết thành công",
      data: tree,
    });
  } catch (error) {
    handleError(res, error, "Lỗi khi lấy danh sách danh mục bài viết");
  }
};
module.exports.create = async (req, res) => {
  try {
    const articleCategory = new ArticleCategory(req.body);
    await articleCategory.save();
    const tree = createTree(records);
    res.status(200).json({
      message: "Thêm mới danh mục bài viết thành công",
      data: tree,
    });
  } catch (error) {
    handleError(res, error, "Lỗi khi thêm mới danh mục bài viết");
  }
};
module.exports.edit= async (req, res) => {
    try {
        const id = req.params.id;
        const newArticleCategory = await ArticleCategory.findOne({
            _id: id,
            deleted: false
        })
        if(!newArticleCategory) {
            return res.status(404).json({
                success: false,
                message:"Không tìm thấy bài viết",
            })
        }
    } catch(error) {
        handleError(res, error, "Lỗi khi cập nhật bài viết");
    }
};
module.exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        await ArticleCategory.updateOne({
            _id: id,
            deleted: false
        }, {
            deleted: true,
            deletedAt: new Date()
        })
        res.json({
            code: 200,
            message: "Xóa thành công"
        })
    } catch (error) {
        handleError(res, error, "Lỗi khi xóa bài viết");
    }
}
module.exports.detail = async (req, res) => {
    try {
        const id = req.params.id;
        const articleCategory = await ArticleCategory.findOne({
            _id: id,
            deleted: false
        })
        if(!articleCategory) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy bài viết"
            })
        }
    } catch(error) {
        handleError(res, error, "Lỗi khi lấy chi tiết bài viết");
    }
}
module.exports.changeStatus = async (req, res) => {
    try {
        const id = req.params.id;
        const status = req.params.status;
        await ArticleCategory.updateOne({
            _id: id,
            deleted: false
        }, {
            status: status
        })
        res.json({
            code: 200,
            message: "Cập nhật trạng thái thành công"
        });
    } catch (error) {
        res.json({
            code: 404,
            message: "Không tồn tại"
        })
    }
}