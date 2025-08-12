const Product = require("../models/productmodel");
const Comment = require("../models/comment.model");
const ProductCategory = require("../models/productCategory");
const productHelper = require("../../helpers/product.helper");
const categoryHelper = require("../../helpers/category.helper");
const paginationHelper = require("../../helpers/pagination");
const handleError = require("../../helpers/handleError")

module.exports.index = async (req, res) => {
    const find = {
        status: "active",
        deleted: false,
    };
    const countProducts = await Product.countDocuments(find);
    let objectPagination = {
        currentPage: 1,
        limitItems: 16,
    };
    paginationHelper(objectPagination, req.query, countProducts);
    const product = await Product.find(find)
        .sort({ position: "desc" })
        .limit(objectPagination.limitItems)
        .skip(objectPagination.skip);
    const newProducts = productHelper.calcNewPrice(product);
    res.json({
        success: true,
        data: newProducts,
        pagination: objectPagination,
    })
}
module.exports.category = async (req, res) => {
    try {
        const slugCategory = req.params.slugCategory;
        const category = await ProductCategory.findOne({
            slug: slugCategory,
            deleted: false,
            status: "active",
        });
        if (category) {
            const listSubCategory = await categoryHelper.getSubCategory(category.id);
            const listSubCategoryId = listSubCategory.map(item => item.id);
            const allCategoryIds = [category.id, ...listSubCategoryId];
            const find = {
                product_category_id: { $in: allCategoryIds },
                deleted: false,
                status: "active",
            }
            const countProducts = await Product.countDocuments(find);
            let objectPagination = {
                currentPage: 1,
                limitItems: 16,
            };
            paginationHelper(objectPagination, req.query, countProducts);
            const products = await Product.find(find)
                .sort({ position: "desc" })
                .limit(objectPagination.limitItems)
                .skip(objectPagination.skip);
            const newProducts = productHelper.calcNewPrice(products);
            res.status(200).json({
                success: true,
                data: newProducts,
                pagination: objectPagination,
            })
        } else {
            res.status(200).json({
                success: false, 
                message: "Không tìm thấy danh mục sản phẩm",
            })
        }
    } catch (error) {
        handleError(res, error, "Lỗi khi lấy danh sách sản phẩm theo danh mục");
    }
}
module.exports.detail = async (req, res) => {
    try {
        const find = {
            deleted: false,
            slug: req.params.slug
        };
        const product = await Product.findOne(find).populate("product_category_id");
        if (product) {
            const [comments, relatedProducts] = await Promise.all([
                Comment.find({
                    product_id: product.id,
                    deleted: false,
                }).sort({ createdAt: "desc" }),
                Product.find({
                    _id: { $ne: product.id },
                    product_category_id: product.product_category_id,
                    status: "active",
                    deleted: false,
                }).limit(4)
            ]);
            const newProduct = productHelper.calcNewPrice([product])[0];
            const newRelatedProducts = productHelper.calcNewPrice(relatedProducts);
            res.status(200).json({
                success: true,
                data: {
                    product: newProduct,
                    comments: comments,
                    relatedProducts: newRelatedProducts
                }
            })
        }
    } catch (error) {
        handleError(res, error, "Lỗi khi lấy chi tiết sản phẩm");
    }
}
module.exports.createComment = async (req, res) => {
    try {
        const slug = req.params.slug;
        const product = await Product.findOne({
            slug: slug,
            deleted: false,
            status: "active",
        })
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy sản phẩm"
            })
        }
        const comment = new Comment({
            product_id: product.id,
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