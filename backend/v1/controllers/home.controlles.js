const Product = require("../models/productmodel");
const ProductCategory = require("../models/productCategory");
const Article = require("../models/articles.models");
const productHelper = require("../../helpers/product.helper");
const categoryHelper = require("../../helpers/category.helper");
const Category = require("../models/productCategory");
const paginationHelper = require("../../helpers/pagination");
const searchHelper = require("../../helpers/search");

const buildSortObject = require("../../helpers/buildSortObject");
const handleError = require("../../helpers/handleError");

module.exports.index = async (req, res) => {
  try {
    // Khởi tạo filter object
    let filter = {
      deleted: false,
      status: "active",
    };

    // Lọc theo danh mục nếu có (hỗ trợ cả category và categorys)
    if (req.query.category || req.query.categorys) {
      const categoryId = req.query.category || req.query.categorys;
      
      // Lấy category và tất cả subcategory
      const category = await ProductCategory.findById(categoryId);
      if (category) {
        const listSubCategory = await categoryHelper.getSubCategory(categoryId);
        const listSubCategoryId = listSubCategory.map((item) => item._id);
        const allCategoryIds = [categoryId, ...listSubCategoryId];
        
        filter.product_category_id = { $in: allCategoryIds };
        console.log("Category filter applied:", allCategoryIds);
      }
    }

    // Tìm kiếm theo keyword nếu có
    if (req.query.keyword) {
      const regex = new RegExp(req.query.keyword, "i");
      filter.$or = [{ title: regex }, { description: regex }];
    }

    // Lọc theo brand nếu có
    if (req.query.brand) {
      filter.brand = new RegExp(req.query.brand, "i");
    }

    // Nếu có filter theo category, chỉ trả về sản phẩm của category đó
    if (req.query.category || req.query.categorys) {
      const sort = buildSortObject(req);
      const countRecords = await Product.countDocuments(filter);
      const pagination = paginationHelper(
        { limitItems: parseInt(req.query.limit) || 4 },
        req.query,
        countRecords
      );

      const products = await Product.find(filter)
        .populate("product_category_id", "title")
        .sort(sort)
        .skip(pagination.skip)
        .limit(pagination.limitItems);

      const productsWithNewPrice = productHelper.calcNewPrice(products);

      return res.status(200).json({
        success: true,
        message: products.length > 0 ? "Lấy sản phẩm theo danh mục thành công" : "Không tìm thấy sản phẩm nào trong danh mục này",
        data: productsWithNewPrice,
        pagination,
        totalProducts: countRecords,
      });
    }

    // Nếu không có filter category, trả về data trang chủ như cũ
    const productsFeatured = await Product.find({
      featured: "1",
      deleted: false,
      status: "active",
    }).limit(4);
    const newProductsFeatured = productHelper.calcNewPrice(productsFeatured);

    const productsNew = await Product.find({
      status: "active",
      deleted: false,
    })
      .sort({ position: "desc" })
      .limit(4);
    const newProductsNew = productHelper.calcNewPrice(productsNew);

    const categories = await ProductCategory.find({
      deleted: false,
      status: "active",
      parent_id: "",
    });

    const categoriesWithProducts = await Promise.all(
      categories.map(async (category) => {
        const listSubCategory = await categoryHelper.getSubCategory(category._id);
        const listSubCategoryId = listSubCategory.map((item) => item._id);
        const allCategoryIds = [category._id, ...listSubCategoryId];

        const productsInCategory = await Product.find({
          product_category_id: { $in: allCategoryIds },
          deleted: false,
          status: "active",
        })
        .sort({ position: "desc" })
        .limit(4);
        
        return {
          ...category.toObject(),
          products: productHelper.calcNewPrice(productsInCategory),
        };
      })
    );

    const articlesFeatured = await Article.find({
      featured: "1",
      deleted: false,
      status: "active",
    })
      .sort({ position: "desc" })
      .limit(6);

    res.status(200).json({
      success: true,
      data: {
        productsFeatured: newProductsFeatured,
        productsNew: newProductsNew,
        categories: categoriesWithProducts,
        articlesFeatured,
      },
    });
  } catch (error) {
    handleError(res, error, "Lỗi khi lấy dữ liệu trang chủ");
  }
};

module.exports.getByBrand = async (req, res) => {
  try {
    const brand = req.params.brand;

    if (!brand) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp tên brand",
      });
    }

    const filter = {
      brand: new RegExp(brand, "i"),
      deleted: false,
      status: "active",
    };

    // Thêm các filter khác nếu có
    if (req.query.keyword) {
      const regex = new RegExp(req.query.keyword, "i");
      filter.$or = [{ title: regex }, { description: regex }];
    }

    const sort = buildSortObject(req);
    const countRecords = await Product.countDocuments(filter);
    const pagination = paginationHelper(
      { limitItems: parseInt(req.query.limit) || 6 },
      req.query,
      countRecords
    );

    const products = await Product.find(filter)
      .populate("product_category_id", "title")
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limitItems);

    if (products.length === 0) {
      return res.status(200).json({
        success: true,
        message: `Không tìm thấy sản phẩm nào của brand "${brand}"`,
        data: [],
        pagination,
        brand: brand,
      });
    }

    res.status(200).json({
      success: true,
      message: `Lấy danh sách sản phẩm của brand "${brand}" thành công`,
      data: products,
      pagination,
      brand: brand,
      totalProducts: countRecords,
    });
  } catch (error) {
    handleError(res, error, "Lỗi khi lấy sản phẩm theo brand");
  }
};

module.exports.getAllBrands = async (req, res) => {
  try {
    const brands = await Product.distinct("brand", {
      deleted: false,
      status: "active",
      brand: { $ne: null, $ne: "" },
    });
    const brandCounts = await Product.aggregate([
      {
        $match: {
          deleted: false,
          status: "active",
          brand: { $ne: null, $ne: "" },
        },
      },
      {
        $group: {
          _id: "$brand",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    res.status(200).json({
      success: true,
      message: "Lấy danh sách brand thành công",
      data: {
        brands: brands.sort(),
        brandCounts: brandCounts,
      },
      totalBrands: brands.length,
    });
  } catch (error) {
    handleError(res, error, "Lỗi khi lấy danh sách brand");
  }
};

module.exports.getByCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;

    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp ID danh mục",
      });
    }

    // Kiểm tra danh mục có tồn tại không
    const category = await ProductCategory.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy danh mục",
      });
    }

    // Khởi tạo filter object
    let filter = {
      deleted: false,
      status: "active",
    };

    // Lấy category và tất cả subcategory
    const listSubCategory = await categoryHelper.getSubCategory(categoryId);
    const listSubCategoryId = listSubCategory.map((item) => item._id);
    const allCategoryIds = [categoryId, ...listSubCategoryId];
    
    filter.product_category_id = { $in: allCategoryIds };

    // Tìm kiếm theo keyword nếu có
    if (req.query.keyword) {
      const regex = new RegExp(req.query.keyword, "i");
      filter.$or = [{ title: regex }, { description: regex }];
    }

    // Lọc theo brand nếu có
    if (req.query.brand) {
      filter.brand = new RegExp(req.query.brand, "i");
    }

    // Lọc theo giá nếu có
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) {
        filter.price.$gte = parseInt(req.query.minPrice);
      }
      if (req.query.maxPrice) {
        filter.price.$lte = parseInt(req.query.maxPrice);
      }
    }

    const sort = buildSortObject(req);
    const countRecords = await Product.countDocuments(filter);
    const pagination = paginationHelper(
      { limitItems: parseInt(req.query.limit) || 12 },
      req.query,
      countRecords
    );

    const products = await Product.find(filter)
      .populate("product_category_id", "title slug")
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limitItems);

    if (products.length === 0) {
      return res.status(200).json({
        success: true,
        message: `Không tìm thấy sản phẩm nào trong danh mục "${category.title}"`,
        data: [],
        pagination,
        category: {
          _id: category._id,
          title: category.title,
          slug: category.slug
        },
        totalProducts: countRecords,
      });
    }

    const productsWithNewPrice = productHelper.calcNewPrice(products);

    // Lấy danh sách brand trong danh mục để filter
    const brandsInCategory = await Product.distinct("brand", {
      product_category_id: { $in: allCategoryIds },
      deleted: false,
      status: "active",
      brand: { $ne: null, $ne: "" },
    });

    res.status(200).json({
      success: true,
      message: `Lấy sản phẩm danh mục "${category.title}" thành công`,
      data: productsWithNewPrice,
      pagination,
      category: {
        _id: category._id,
        title: category.title,
        slug: category.slug
      },
      brandsInCategory: brandsInCategory.sort(),
      totalProducts: countRecords,
    });
  } catch (error) {
    handleError(res, error, "Lỗi khi lấy sản phẩm theo danh mục");
  }
};