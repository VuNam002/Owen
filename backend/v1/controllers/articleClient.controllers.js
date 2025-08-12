const Article = require("../models/articles.models");
const Comment = require("../models/comment.model");
const ArticleCategory = require("../models/article-category.models");
const articleHelper = require("../../helpers/article.helper");
const articleCategoryHelper = require("../../helpers/article-category.helper");
const paginationHelper = require("../../helpers/pagination");
const { deleted } = require("./roles.controllers");
const handleError = require("../../helpers/handleError")

module.exports.index = async (req, res) => {
    try {
        const find = {
            status: "active",
            deleted: false,
        };
        const countArticles = await Article.countDocuments(find);
        let objectPagination = {
            currentPage: 1,
            limitItems: 10,
        };
        paginationHelper(objectPagination, req.query, countArticles);

        const [articlesFeatured, articlesNew, articles] = await Promise.all([
            articleHelper.getFeaturedArticles(3),
            articleHelper.getNewArticles(3),
            Article.find(find)
                .sort({ position: "desc" })
                .limit(objectPagination.limitItems)
                .skip(objectPagination.skip),
        ]);
        res.json({
            code: 200,
            message: "Lấy danh sách bài viết thành công",
            data: {
                articlesFeatured: articlesFeatured,
                articlesNew: articlesNew,
                articles: articles,
                pagination: objectPagination,
            }
        })
    } catch (error) {
        handleError(res, error, "Lỗi khi lấy danh sách bài viết");
    }
}
module.exports.detail = async (req, res) => {
    try {
        const slug = req.params.slug;
        const article = await Article.findOne({
            slug: slug,
            deleted: false,
            status: "active",
        }).populate("article_category_id");

        if(article) {
            const [
                relatedArticles,
                comments,
                articlesFeatured,
                articlesNew
            ] = await Promise.all([
                Article.find({
                    _id: { $ne: article.id },
                    article_category_id: article.article_category_id,
                    status: "active",
                    deleted: false,
                }).sort({ position: "desc" }).limit(4),
                Comment.find({
                    article_id: article.id,
                    deleted: false,
                }).sort({ createdAt: "desc" }),
                articleHelper.getFeaturedArticles(5),
                articleHelper.getNewArticles(5)
            ]);
            res.json({
                code: 200,
                message: "Lấy chi tiết bài viết thành công",
                data: {
                    article: article,
                    relatedArticles: relatedArticles,
                    comments: comments,
                    articlesFeatured: articlesFeatured,
                    articlesNew: articlesNew,
                }
            })
        }
    } catch (error) {
        handleError(res, error, "Lỗi khi lấy chi tiết bài viết");
    }
}
module.exports.createComment = async (req, res) => {
    try {
        const slug = req.params.slug;
        const article = await Article.findOne({
            slug: slug,
            deleted: false,
            status: "active",
        })
        if(!article) {
            res.status(400).json({
                succers: false,
                message: "Không tìm thấy bài viết",
            })
        }
        const comment = new Comment({
            article_id: article.id,
            fullName: req.body.fullName,
            email: req.body.email,
            content: req.body.content,
        });
        await comment.save();
        res.status(200).json({
            success: true,
            message: "Thêm bình luận thành công",
            data: comment,
        })
    } catch (error) {
        handleError(res, error, "Lỗi khi thêm bình luận");
    }
}
module.exports.category = async (req, res) => {
    try {
        const slugCategory = req.params.slugCategory;
        const category = await ArticleCategory.findOne({
            slug: slugCategory,
            deleted: false,
            status: "active",
        });
        if(category) {
            const listSubCategory = await articleCategoryHelper.getSubCategory(category.id);
            const listSubCategoryId = listSubCategory.map(item => item.id);
            const allCategoryIds = [category.id, ...listSubCategoryId];
            const find = {
                article_category_id: { $in: allCategoryIds },
                deleted: false,
                status: "active",
            };
            const countArticles = await Article.countDocuments(find);
            let objectPagination = {
                currentPage: 1,
                limitItems: 10,
        };
        paginationHelper(objectPagination, req.query, countArticles);
        const articles = await Article.find(find)
            .sort({ position: "desc" })
            .limit(objectPagination.limitItems)
            .skip(objectPagination.skip);
            res.json({
                success: true,
                message: "Lấy danh sách bài viết thành công",
                data: articles,
                pagination: objectPagination,
            })
        } else {
            res.status(200).json({
                success: false,
                message: "Không tìm thấy danh mục bài viết",
            })
        }
    } catch (error) {
        handleError(res, error, "Lỗi khi lấy danh sách bài viết theo danh mục");
    }
}