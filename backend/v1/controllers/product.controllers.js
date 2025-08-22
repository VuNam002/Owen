const Product = require("../models/productmodel");
const Category = require("../models/productCategory");
const paginationHelper = require("../../helpers/pagination");
const searchHelper = require("../../helpers/search");

const buildSearchFilter = require("../../helpers/buildSearchFilter");
const buildPagination = require("../../helpers/buildPagination");
const buildSortObject = require("../../helpers/buildSortObject");
const handleError = require("../../helpers/handleError");



module.exports.index = async (req, res) => {
    try {
      const objectSearch = searchHelper(req.query);
      // Truyền Category model vào buildSearchFilter
      const filter = await buildSearchFilter(objectSearch, Category);
      const sort = buildSortObject(req);
      // Truyền Product model và paginationHelper vào buildPagination
      const pagination = await buildPagination(req, filter, Product, paginationHelper);

      const products = await Product.find(filter)
        .populate("product_category_id", "title")
        .sort(sort)
        .skip(pagination.skip)
        .limit(pagination.limitItems);
      if (products.length === 0) {
        return res.status(200).json({
            success: true,
            message: "Không tìm thấy sản phẩm nào",
            data: [],
            pagination,
        });
      }

      res.status(200).json({
        success: true,
        message: "Lấy danh sách sản phẩm thành công",
        data: products,
        pagination,
      });
    } catch (error) {
        handleError(res, error, "Lỗi khi lấy danh sách sản phẩm");
    }
};
module.exports.changeStatus = async (req, res) => {
    try {
        const id = req.params.id;
        const status = req.params.status;
        await Product.updateOne({ _id: id }, { status: status });
        res.json({
            success: true,
            message: "Cập nhật trạng thái thành công"
        });
    } catch (error) {
        handleError(res, error, "Lỗi khi cập nhật trạng thái sản phẩm");
    }
}
module.exports.changePosition = async (req, res) => {
    try {
        const positions = req.body.positions;
        if(!positions){
            return res.status(400).json({
                success: false,
                message: "Vị trí không hợp lệ"
            })
        }
        const updates = Object.entries(positions).map(([id, position]) => ({
            updateOne: {
                filter: { _id: id },
                update: { $set: { position: Number(position) } },
            },
        }));
        await Product.bulkWrite(updates);
        res.json({
            success: true,
            message: "Cập nhật vị trí thành công"
        })
    } catch (error) {
        handleError(res, error, "Lỗi khi cập nhật vị trí sản phẩm");
    }
}
module.exports.create = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json({
      success: true,
      message: "Thêm sản phẩm mới thành công",
      data: product,
    });
  } catch (error) {
    handleError(res, error, "Lỗi khi thêm sản phẩm mới");
  }
}

module.exports.edit = async (req, res) => {
    try {
        const id = req.params.id;
        await Product.updateOne({
            _id: id,
            deleted: false,
        }, req.body); 
        res.json({
            success: true,
            message: "Cập nhật sản phẩm thành công"
        })
    } catch(error) {
        handleError(res, error, "Lỗi khi cập nhật sản phẩm");
    }
}
module.exports.delete = async (req, res) => {
    try {
        const id= req.params.id;
        await Product.updateOne({
            _id: id,
            deleted: false,
        }, {
            deleted: true,
            deletedAt: new Date(),
        })
        res.json({
            success: true,
            message: "Xóa sản phẩm thành công"
        })
    } catch (error) {
        handleError(res, error, "Lỗi khi xóa sản phẩm");
    }
}
module.exports.detail = async (req, res) => {
    try {
        const id = req.params.id;
        const product = await Product.findOne({
            _id: id,
            deleted: false
        })
        if(!product) {
            return res.status(400).json({
                success: false,
                message: "Không tìm thấy sản phẩm"
            })
        }
        res.status(200).json({
            success: true,
            message: "Lấy chi tiết sản phẩm thành công",
            data: product
        })
    } catch (error) {
        handleError(res, error, "Lỗi khi lấy chi tiết sản phẩm");
    }
}