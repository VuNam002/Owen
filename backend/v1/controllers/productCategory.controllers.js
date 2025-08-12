const ProductCategory = require("../models/productCategory");
const Product = require("../models/productmodel");
const paginationHelper = require("../../helpers/pagination");
const searchHelper = require("../../helpers/search");
const Account = require("../models/account.models");

const buildSearchFilter = require("../../helpers/buildSearchFilter");
const buildPagination = require("../../helpers/buildPagination");
const buildSortObject = require("../../helpers/buildSortObject");
const handleError = require("../../helpers/handleError");

function createTree (arr, parentId = "") {
    const tree = [];
    arr.forEach((item) => {
        if(String(item.parent_id || "") === String(parentId)) {
            const newItem = {...item};
            const children = createTree(arr, item._id);
            if(children.length > 0) {
                newItem.children = children;
            }
            tree.push(newItem);
        }
    });
    return tree;
}

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

        const records = await ProductCategory.find(find)
            .sort({ position: "asc" })
            .populate({
                path: "created_by",
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
        const id= req.params.id;
        const newProductCategory = await ProductCategory.findOne({
            _id: id,
            deleted: false,
        });
        if(!newProductCategory) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy danh mục sản phẩm."
            })
        }
    } catch(error) {
        handleError(res, error, "Lỗi khi cập nhật danh mục sản phẩm.");
    }
}
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
        await ProductCategory.updateOne({
            _id: id,
            deleted: false,
        }, {
            deleted: true,
            deletedAt: new Date(),  
        })
    } catch (error) {
        handleError(res, error, "Lỗi khi xóa danh mục sản phẩm.");
    }
}