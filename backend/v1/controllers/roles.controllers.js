const Role = require("../models/role.models");
const handleError = require("../../helpers/handleError");
const buildPagination = require("../../helpers/buildPagination");
const buildSortObject = require("../../helpers/buildSortObject");
const buildSearchFilter = require("../../helpers/buildSearchFilter");
const paginationHelper = require("../../helpers/pagination");
const searchHelper = require("../../helpers/search");

module.exports.index = async (req, res) => {
  try {
    const objectSearch = searchHelper(req.query);
    const filter = await buildSearchFilter(objectSearch, Role);
    const sort = buildSortObject(req);
    const pagination = await buildPagination(req, filter, Role, paginationHelper);
    const records = await Role.find(filter)
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limitItems);
    res.json({
        success: true,
        message: "Lấy danh sách nhóm quyền thành công",
        data: records,
        pagination,
    });

  } catch (error) {
    handleError(res, error, "Lỗi khi lấy danh sách nhóm quyền");
  }
};
module.exports.create = async (req, res) => {
  try {
    const role = new Role(req.body);
    await role.save();
    res.json({
      success: true,
      message: "Thêm mới nhóm quyền thành công",
      data: role,
    });
  } catch (error) {
    handleError(res, error, "Lỗi khi thêm mới nhóm quyền");
  }
};
module.exports.edit = async (req, res) => {
  try {
    const id = req.params.id;
    await Role.updateOne({
      _id: id,
      deleted: false,
    });
    res.json({
      success: true,
      message: "Cập nhật nhóm quyền thành công",
    });
  } catch (error) {
    handleError(res, error, "Lỗi khi cập nhật nhóm quyền");
  }
};
module.exports.deleted = async (req, res) => {
    try {
        const id = req.params.id;
        await Role.updateOne(
            { _id: id }, 
            { $set: { deleted: true, deleteAt: new Date() } }
        );
        res.json({
            success: true,
            message: "Xóa nhóm quyền thành công",
        })
    } catch(error) {
        handleError(res, error, "Lỗi khi xóa nhóm quyền");
    }
}
module.exports.changeStatus = async (req, res) => {
    try {
        const id = req.params.id;
        const status = req.params.status;
        await Role.updateOne({ _id: id }, { status: status });
        res.json({
            success: true,
            message: "Cập nhật trạng thái thành công",
        });
    } catch (error) {
        handleError(res, error, "Lỗi khi cập nhật trạng thái nhóm quyền");
    }
}
module.exports.detail = async (req, res) => {
    try {
        const id = req.params.id;
        const role = await Role.findOne({
            _id: id,
            deleted: false,
        });
        if(!role) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy nhóm quyền này"
            })
        }
        res.json(role);
    } catch (error) {
        handleError(res, error, "Lỗi khi lấy chi tiết nhóm quyền");
    }
}