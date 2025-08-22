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
module.exports.index = async (req, res) => {
    try {
        const find = { deleted: false };
        const objectSearch = searchHelper(req.query);
        const filter = await buildSearchFilter(objectSearch, ProductCategory);
        const sort = buildSortObject(req);
        const pagination = await buildPagination(req, filter, ProductCategory, paginationHelper);

        const records = await ProductCategory.find(find)
            .sort({ position: "asc" })
            .populate({
                path: "createdBy",
                select: "fullName" 
            })
            .lean();

        const tree = createTree(records);

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
        const productCategory = new ProductCategory(req.body);
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
        })
    } catch (error) {
        handleError(res, error, "Lỗi khi thêm mới danh mục sản phẩm.");
    }
}
module.exports.changeStatus = async (req, res) => {
    try {
        const id = req.params.id;
        const status = req.params.status;
        await ProductCategory.updateOne({ _id: id }, { status: status });
        res.status(200).json({
            success: true,
            message: "Cập nhật trạng thái thành công.",
        });
    } catch (error) {
        handleError(res, error, "Lỗi khi cập nhật trạng thái.");
    }
}
module.exports.edit = async (req, res) => {
    try {
        const id = req.params.id;
        const updatedData = req.body;
        const result = await ProductCategory.updateOne({ _id: id, deleted: false }, updatedData);

        if (result.nModified === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy danh mục sản phẩm hoặc không có gì thay đổi."
            });
        }

        const updatedProductCategory = await ProductCategory.findById(id);

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
        });
        if(!productCategory) {
            return res.status(404).json({
                message: "Không tìm thấy danh mục sản phẩm."
            })
        }
        return res.json(productCategory);
    } catch (error) {
        handleError(res, error, "Lỗi khi lấy chi tiết danh mục sản phẩm.");
    }
}
module.exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await ProductCategory.updateOne(
            { _id: id, deleted: false },
            { deleted: true, deletedAt: new Date() }
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
}