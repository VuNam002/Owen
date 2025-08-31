const ArticleCategory = require("../models/article-category.models")
const Article = require("../models/articles.models")
const Account = require("../models/account.models")
const handleError = require("../../helpers/handleError")
const paginationHelper = require("../../helpers/pagination")
const searchHelper = require("../../helpers/search")
const buildSearchFilter = require("../../helpers/buildSearchFilter")
const buildPagination = require("../../helpers/buildPagination")
const buildSortObject = require("../../helpers/buildSortObject")

module.exports.index = async (req, res) => {
    try {
        const objectSearch = searchHelper(req.query);
        const filter = await buildSearchFilter(objectSearch, Article);
        const sort = buildSortObject(req);
        const pagination = await buildPagination(req, filter, Article, paginationHelper);

        const records = await Article.find(filter)
            .populate("article_category_id", "title") 
            .sort(sort)
            .skip(pagination.skip)
            .limit(pagination.limitItems)
            .lean(); 

        // Tối ưu việc lấy thông tin người tạo
        const accountIds = records
            .filter(record => record.createdBy && record.createdBy.account_id)
            .map(record => record.createdBy.account_id);
        
        const uniqueAccountIds = [...new Set(accountIds)];

        if (uniqueAccountIds.length > 0) {
            const users = await Account.find({ _id: { $in: uniqueAccountIds } }).select("fullName").lean();
            const userMap = users.reduce((map, user) => {
                map[user._id.toString()] = user.fullName;
                return map;
            }, {});

            // Gán tên người tạo vào mỗi bài viết
            records.forEach(record => {
                if (record.createdBy && record.createdBy.account_id) {
                    record.accountfullName = userMap[record.createdBy.account_id.toString()];
                }
            });
        }

        if (records.length === 0) {
            return res.status(200).json({
                success: true,
                message: "Không tìm thấy bài viết nào",
                data: [],
                pagination,
            });
        }
        res.status(200).json({ success: true, message: "Lấy danh sách bài viết thành công", data: records, pagination });
    } catch (error) {
        handleError(res, error, "Lỗi khi lấy danh sách bài viết");
    }
};
module.exports.create = async (req, res) => {
    try {
        const { title, article_category_id } = req.body;
        if (!title || !article_category_id) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập đầy đủ tiêu đề và danh mục bài viết.",
            });
        }
        const categoryExists = await ArticleCategory.findById(article_category_id);
        if (!categoryExists) {
            return res.status(400).json({
                success: false,
                message: "Danh mục bài viết không tồn tại.",
            });
        }
        const newArticle = new Article(req.body);
        await newArticle.save();
        res.status(201).json({
            success: true,
            message: "Thêm bài viết mới thành công.",
            data: newArticle,
        });
    } catch (error) {
        handleError(res, error, "Lỗi khi thêm bài viết mới");
    }
};
module.exports.edit = async (req, res) => {
    try {
        const id = req.params.id;
        const updateData = req.body;

        if (updateData.article_category_id) {
            const categoryExists = await ArticleCategory.findOne({
                _id: updateData.article_category_id,
                deleted: false
            });
            if (!categoryExists) {
                return res.status(400).json({
                    success: false,
                    message: "Danh mục bài viết không tồn tại.",
                });
            }
        }
        const updatedArticle = await Article.findOneAndUpdate(
            { _id: id, deleted: false },
            { $set: updateData },//dữ liệu cần cập nhật
            { new: true }
        ).populate("article_category_id", "title");

        if (!updatedArticle) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy bài viết hoặc đã bị xóa."
            });
        }
        res.status(200).json({
            success: true,
            message: "Cập nhật bài viết thành công.",
            data: updatedArticle,
        });
    } catch (error) {
        handleError(res, error, "Lỗi khi cập nhật bài viết");
    }
}
module.exports.detail = async (req, res) => {
  const id = req.params.id
  const article = await Article.findOne({
    _id: id,
    deleted: true,
  })
  if(!article) {
    return res.status(400).json({
        success: false,
        message: "Không tìm thấy bài viết",
    })
  }
    res.status(200).json({
        success: true,
        message: "Lấy danh sách bài viết thành công"
    })
}
module.exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        await Article.updateOne({
            _id: id
        }, {
            deleted: true,
            deletedBy: {
                account_id: res.locals.user._id,
                deletedAt: new Date(),
            }
        })
        res.status(200).json({
            success: true,
            message: "bài viết thành công",
        })
    } catch (error) {
        handleError(res, error, "Lỗi khi xóa bài viết")
    }
}
module.exports.changeStatus = async (req, res) => {
    try {
        const id = req.params.id;
        const status = req.params.status;
        await Article.updateOne({
            _id: id,
            deleted: false,
        }, {
            status: status,
        })
        res.status(200).json({
            success: true,
            message: "Cập nhật trạng thái thành công",
        })
    } catch (error) {
        handleError(res, error, "Lỗi khi cập nhật trạng thái bài viết");
    }
}
module.exports.createComment = async (req, res) => {
    try {
        const slug = req.params.slug;
        const article = await Article.findOne({
            slug: slug,
            deleted: false,
        })
        if(!article) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy bài viết",
            })
        }
        const comment = new Comment({
            article_id: article._id,
            fullName: req.body.fullName,
            email: req.body.email,
            content: req.body.content,
        })
        await comment.save()
        res.status(201).json({
            success: true,
            message: "Thêm bình luận thành công",
            data: comment,
        })
    } catch (error) {
        handleError(res, error, "Lỗi khi thêm bình luận")
    }
}