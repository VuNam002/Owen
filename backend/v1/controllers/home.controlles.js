const Product = require("../models/productmodel");
const ProductCategory = require("../models/productCategory");
const Article = require("../models/articles.models");
const productHelper = require("../../helpers/product.helper");
const categoryHelper = require("../../helpers/category.helper")

module.exports.index = async (req, res) => {
    const productsFeatured = await Product.find({
        featured: "1",
        deleted: false,
        status: "active",
    }).limit(8);
    const newProductsFeatured = productHelper.calcNewPrice(productsFeatured);

    //lấy ra sản phẩm mới nhất
    const productsNew = await Product.find({
        status: "active",
        deleted: false,
    }).sort({ createdAt: "desc" }).limit(8);
    const newProductsNew = productHelper.calcNewPrice(productsNew);
    //Lấy ra danh sách sản phẩm theo danh mục
    const categories = await ProductCategory.find({
        deleted: false,
        status: "active",
        parent_id: "",
    })
    for( const category of categories) {
        const listSubCategory = await categoryHelper.getSubCategory(category.id);
        const listSubCategoryId = listSubCategory.map(item => item.id);
        const allCategoryIds = [category.id, ...listSubCategoryId];
        const productsInCategory = await Product.find({
            product_category_id: { $in: allCategoryIds },
            deleted: false,
            status: "active",
        }).sort({ position: "desc" }).limit(8);
        category.products = productHelper.calcNewPrice(productsInCategory);
    }
    //Lấy ra bài viết nổi bật
    const articlesFeatured = await Article.find({
        featured: "1",
        deleted: false,
        status: "active",
    }).sort({ position: "desc" }).limit(6);
    res.status(200).json({
        success: true,
        data: {
            productsFeatured: newProductsFeatured,
            productsNew: newProductsNew,
            categories,
            articlesFeatured,
        }
    })
}