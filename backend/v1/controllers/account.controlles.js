const Account = require("../models/account.models");
const Role = require("../models/role.models");
const md5 = require("md5");
const handleError = require("../../helpers/handleError");

module.exports.index = async (req, res) => {
    let find = {
        deleted: false,
    };
    const records = await Account.find(find).select("-password -token");
    for(const record of records) {
        const role = await Role.findOne ({
            name: record.role_id,
            deleted: false,
        });
        record.role = role;
    }
    res.status(200).json({
        succers: true,
        messages: "Lấy danh sách tài khoản thành công",
        data: records,
    })
}
module.exports.create = async (req, res) => {
    try {
        const emailExist = await Account.findOne({
            email: req.body.email,
            deleted: false,
        });

        if (emailExist) {
            return res.status(400).json({
                success: false,
                message: "Email đã tồn tại",
            });
        }

        req.body.password = md5(req.body.password);
        const newAccount = new Account(req.body);
        await newAccount.save();
        const accountData = newAccount.toObject();
        delete accountData.password;

        res.status(201).json({
            success: true,
            message: "Tạo tài khoản thành công",
            data: accountData,
        });
    } catch (error) {
        console.error(error); 
        res.status(500).json({
            success: false,
            message: "Lỗi khi tạo tài khoản",
        });
    }
};
module.exports.detail = async (req, res) => {
    try {
        const find = {
            _id: req.params.id,
            deleted: false,
        }
        const data = await Account.findOne(find);
        const roles = await Role.find({
            deleted: false,
        }); 
        if(!data) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy tài khoản",
            })
        }
        return res.status(200).json({
            success: true,
            message: "Lấy chi tiết tài khoản thành công",
            data,
            roles,
        })
    } catch (error) {
        handleError(res, error, "Lỗi khi lấy chi tiết tài khoản");
    }
}
module.exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        await Account.updateOne({
            _id: id,
        }, {
            deleted: true
        })
        res.status(200).json({
            success: true,
            message: "Xóa tài khoản thành công",
        })
    } catch (error) {
        handleError(res, error, "Lỗi khi xóa tài khoản");
    }
}
module.exports.changeStatus = async (req, res) => {
    try {
        const id = req.params.id;
        const status = req.params.status;
        await Account.updateOne({
            _id: id,
            deleted: false,
        }, {
            status: status,
        })
        res.json({
            code: 200,
            message: "Cập nhật trạng thái tài khoản thành công",
        })
    } catch (error) {
        handleError(res, error, "Lỗi khi cập nhật trạng thái tài khoản");
    }
}
module.exports.edit = async (req, res) => {
    try {
        const account = await Account.findOne({
            _id: req.params.id,
            deleted: false
        });
        if (!account) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy tài khoản"
            });
        }

        const roles = await Role.find({ deleted: false });
        const emailExist = await Account.findOne({
            _id: { $ne: req.params.id },
            email: req.body.email,
            deleted: false
        });
        if (emailExist) {
            return res.status(400).json({
                success: false,
                message: "Email đã tồn tại"
            });
        }

        if (req.body.password) {
            req.body.password = md5(req.body.password);
        } else {
            delete req.body.password; 
        }
        await Account.updateOne({ _id: req.params.id }, req.body);
        return res.status(200).json({
            success: true,
            message: "Cập nhật tài khoản thành công",
            data: { ...account.toObject(), ...req.body },
            roles
        });

    } catch (error) {
        handleError(res, error, "Lỗi khi cập nhật tài khoản");
    }
};
