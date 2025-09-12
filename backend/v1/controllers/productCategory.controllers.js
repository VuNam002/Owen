const ProductCategory = require("../models/productCategory");
const Product = require("../models/productmodel");
const paginationHelper = require("../../helpers/pagination");
const searchHelper = require("../../helpers/search");
const Account = require("../models/account.models");

const buildSearchFilter = require("../../helpers/buildSearchFilter");
const buildPagination = require("../../helpers/buildPagination");
const buildSortObject = require("../../helpers/buildSortObject");
const handleError = require("../../helpers/handleError");

const createTree = (arr) => {
    const tree = {};
    const result = [];

    arr.forEach(item => {
        tree[item._id] = { ...item, children: [] };
    });

    arr.forEach(item => {
        if (item.parent_id && tree[item.parent_id]) {
            tree[item.parent_id].children.push(tree[item._id]);
        } else {
            result.push(tree[item._id]);
        }
    });

    return result;
};

async function handlePosition(reqBody) {
    if(reqBody.position === "" || reqBody.position === undefined) {
        const count = await ProductCategory.countDocuments();
        reqBody.position = count + 1;
    } else {
        reqBody.position = parseInt(reqBody.position);
    }
}

// Lấy sản phẩm theo category ID
module.exports.getProductsByCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;

        // Kiểm tra category có tồn tại không
        const category = await ProductCategory.findOne({
            _id: categoryId,
            deleted: false,
            status: "active"
        });

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy danh mục sản phẩm."
            });
        }

        // Build filter cho products
        let productFilter = {
            deleted: false,
            status: "active",
            product_category_id: categoryId
        };

        // Thêm các filter từ query parameters
        if (req.query.minPrice || req.query.maxPrice) {
            productFilter.price = {};
            if (req.query.minPrice) {
                productFilter.price.$gte = parseFloat(req.query.minPrice);
            }
            if (req.query.maxPrice) {
                productFilter.price.$lte = parseFloat(req.query.maxPrice);
            }
        }

        if (req.query.brand) {
            productFilter.brand = req.query.brand;
        }

        if (req.query.keyword) {
            productFilter.$or = [
                { title: { $regex: req.query.keyword, $options: "i" } },
                { description: { $regex: req.query.keyword, $options: "i" } }
            ];
        }

        // Build sort object
        let sortObject = { position: "asc" };
        if (req.query.sort) {
            switch (req.query.sort) {
                case "price-asc":
                    sortObject = { price: 1 };
                    break;
                case "price-desc":
                    sortObject = { price: -1 };
                    break;
                case "newest":
                    sortObject = { createdAt: -1 };
                    break;
                case "name-asc":
                    sortObject = { title: 1 };
                    break;
                case "name-desc":
                    sortObject = { title: -1 };
                    break;
            }
        }

        // Lấy tổng số sản phẩm
        const totalProducts = await Product.countDocuments(productFilter);
        const totalPages = Math.ceil(totalProducts / limit);

        // Lấy danh sách sản phẩm
        const products = await Product.find(productFilter)
            .sort(sortObject)
            .skip(skip)
            .limit(limit)
            .lean();

        // Thêm thông tin giá đã discount
        const productsWithDiscountPrice = products.map(product => {
            let priceNew = product.price;
            if (product.discountPercentage && product.discountPercentage > 0) {
                priceNew = product.price * (1 - product.discountPercentage / 100);
            }
            return {
                ...product,
                priceNew: Math.round(priceNew)
            };
        });

        res.status(200).json({
            success: true,
            message: "Lấy danh sách sản phẩm theo danh mục thành công.",
            data: {
                category: {
                    _id: category._id,
                    title: category.title,
                    description: category.description
                },
                products: productsWithDiscountPrice,
                pagination: {
                    currentPage: page,
                    totalPages: totalPages,
                    totalProducts: totalProducts,
                    limit: limit,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            }
        });
    } catch (error) {
        handleError(res, error, "Lỗi khi lấy danh sách sản phẩm theo danh mục.");
    }
};

// Lấy danh sách categories (cải thiện)
module.exports.index = async (req, res) => {
    try {
        const find = { deleted: false };
        
        // Nếu có query includeProducts=true thì sẽ include số lượng sản phẩm
        const includeProductCount = req.query.includeProducts === "true";
        
        const records = await ProductCategory.find(find)
            .sort({ position: "asc" })
            .populate({
                path: "createdBy",
                select: "fullName" 
            })
            .lean();

        let categoriesWithProducts = records;

        if (includeProductCount) {
            // Thêm thông tin số lượng sản phẩm cho mỗi category
            categoriesWithProducts = await Promise.all(
                records.map(async (category) => {
                    const productCount = await Product.countDocuments({
                        product_category_id: category._id,
                        deleted: false,
                        status: "active"
                    });
                    
                    return {
                        ...category,
                        productCount: productCount,
                        // Tạo URL để lấy sản phẩm theo category
                        productsUrl: `/api/products?category=${category._id}`
                    };
                })
            );
        }

        const tree = createTree(categoriesWithProducts);

        res.status(200).json({
            success: true,
            message: "Lấy danh sách danh mục sản phẩm thành công.",
            data: tree
        });
    } catch (error) {
        handleError(res, error, "Lỗi khi lấy danh sách danh mục sản phẩm.");
    }
};

module.exports.create = async (req, res) => {
    try {
        await handlePosition(req.body);
        
        const productCategory = new ProductCategory({
            ...req.body,
            createdBy: req.user?.id, // Assuming you have user info in request
            createdAt: new Date()
        });
        
        await productCategory.save();
        
        // Lấy lại danh sách sau khi thêm mới
        const records = await ProductCategory.find({ deleted: false })
            .sort({ position: "asc" })
            .populate({
                path: "createdBy",
                select: "fullName" 
            })
            .lean();
        const tree = createTree(records);
        
        res.status(200).json({
            success: true,
            message: "Thêm mới danh mục sản phẩm thành công.",
            data: tree
        });
    } catch (error) {
        handleError(res, error, "Lỗi khi thêm mới danh mục sản phẩm.");
    }
};

module.exports.changeStatus = async (req, res) => {
    try {
        const id = req.params.id;
        const status = req.params.status;
        
        const result = await ProductCategory.updateOne(
            { _id: id, deleted: false },
            { 
                status: status,
                updatedBy: req.user?.id,
                updatedAt: new Date()
            }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy danh mục sản phẩm."
            });
        }
        
        res.status(200).json({
            success: true,
            message: "Cập nhật trạng thái thành công.",
        });
    } catch (error) {
        handleError(res, error, "Lỗi khi cập nhật trạng thái.");
    }
};

module.exports.edit = async (req, res) => {
    try {
        const id = req.params.id;
        const updatedData = {
            ...req.body,
            updatedBy: req.user?.id,
            updatedAt: new Date()
        };
        
        await handlePosition(updatedData);
        
        const result = await ProductCategory.updateOne(
            { _id: id, deleted: false },
            updatedData
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy danh mục sản phẩm hoặc không có gì thay đổi."
            });
        }

        const updatedProductCategory = await ProductCategory.findById(id)
            .populate({
                path: "createdBy",
                select: "fullName"
            });

        res.status(200).json({
            success: true,
            message: "Cập nhật danh mục sản phẩm thành công.",
            data: updatedProductCategory
        });
    } catch (error) {
        handleError(res, error, "Lỗi khi cập nhật danh mục sản phẩm.");
    }
};

module.exports.detail = async (req, res) => {
    try {
        const id = req.params.id;
        const productCategory = await ProductCategory.findOne({
            _id: id,
            deleted: false,
        })
        .populate({
            path: "createdBy",
            select: "fullName"
        })
        .lean();

        if(!productCategory) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy danh mục sản phẩm."
            });
        }

        // Thêm thông tin số lượng sản phẩm
        const productCount = await Product.countDocuments({
            product_category_id: id,
            deleted: false,
            status: "active"
        });

        res.status(200).json({
            success: true,
            message: "Lấy chi tiết danh mục sản phẩm thành công.",
            data: {
                ...productCategory,
                productCount: productCount,
                productsUrl: `/api/products?category=${id}`
            }
        });
    } catch (error) {
        handleError(res, error, "Lỗi khi lấy chi tiết danh mục sản phẩm.");
    }
};

module.exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        
        // Kiểm tra xem category có sản phẩm không
        const productCount = await Product.countDocuments({
            product_category_id: id,
            deleted: false
        });

        if (productCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Không thể xóa danh mục này vì còn ${productCount} sản phẩm đang sử dụng.`
            });
        }
        
        const result = await ProductCategory.updateOne(
            { _id: id, deleted: false },
            { 
                deleted: true, 
                deletedAt: new Date(),
                deletedBy: req.user?.id
            }
        );
        
        if (result.modifiedCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy danh mục hoặc đã bị xóa."
            });
        }
        
        res.status(200).json({
            success: true,
            message: "Xóa danh mục thành công."
        });
    } catch (error) {
        handleError(res, error, "Lỗi khi xóa danh mục sản phẩm.");
    }
};