const Cart = require("../models/cart.models");
const Product = require("../models/productmodel");
const productHelper = require("../../helpers/product.helper");
const handleError = require("../../helpers/handleError")

module.exports.addPost = async (req, res) => {
    try {
        const cardId = res.locals.cardId;
        const productId = req.params.productId;
        const quantity = parseInt(req.body.quantity) || 1;
        const product = await Product.findOne({
            _id: productId,
            deleted: false,
            status: "active",
        });
        if(!product) {
            res.json({
                code: 400,
                message: "Không tìm thấy sản phẩm"
            })
        }
        const cart = await Cart.findById(cardId);
        const existProductInCart = cart.products.find(
            (item) => String(item.product_id) === productId
        );
        if(existProductInCart) {
            existProductInCart.quantity += quantity;
        } else {
            const objectCart = {
                product_id: productId,
                quantity: quantity,
            };
            cart.products.push(objectCart);
        }
        await cart.save();
        res.json({
            code: 200,
            message: "Thêm vào giỏ hàng thành công"
        })
    } catch (error) {
        handleError(res, error, "Lỗi khi thêm vào giỏ hàng");
    }
}
module.exports.index = async (req, res) => {
    try {
        const cartId = req.cookie.cartId;
        const cart = await Cart.findOne({
            _id: cartId,
        });
        if(!cart || cart.products.length === 0) {
            return res.json({
                code: 200,
                message: "Giỏ hàng trống",
                data: {
                    products: [],
                    totalPrice: 0,
                }
            })
        }
        for(const item of cart.products) {
            const productInfo = await Product.findOne({
                _id: item.product_id,
                deleted: false,
            });
            if(productInfo) {
                productInfo.priceNew = productHelper.calcNewPrice([productInfo])[0].priceNew;
                item.productInfo = productInfo;
                item.totalPrice = item.quantity * item.productInfo.priceNew;
            }
        }
        cart.products = cart.products.filter(item => item.productInfo);
        cart.totalPrice = cart.products.reduce((sum, item) => sum + item.totalPrice, 0);

        res.json({
            code: 200,
            message: "Lấy danh sách sản phẩm thành công",
            data: cart,
        })
    } catch (error) {
        handleError(res, error, "Lỗi khi lấy danh sách sản phẩm");
    }
}
module.exports.delete = async (req, res) => {
    try {
        const cartId = req.cookie.cartId;
        const productId = req.params.productId;
        await Cart.updateOne({
            _id: cartId,
        }, {
            "$pull": {
                products: {
                    product_id: productId,
                },
            },
        });
        res.json({
            code: 200,
            message: "Xóa sản phẩm khỏi giỏ hàng thành công",
        })
    } catch (error) {
        handleError(res, error, "Lỗi khi xóa sản phẩm khỏi giỏ hàng");
    }
}
module.exports.update = async (req, res) => {
    try {
        const cartId = req.cookie.cartId;
        const productId = req.params.productId;
        const quantity = parseInt(req.params.quantity);
        if(isNaN(quantity) || quantity < 1) {
            return res.json({
                code: 400,
                message: "Số lượng không hợp lệ",
            })
        }
        await Cart.updateOne({
            _id: cartId,
            "products.product_id": productId,
        }, {
            $set: {
                "products.$.quantity": quantity,
            },
        });
        res.json({
            code: 200,
            message: "Cập nhật số lượng thành công",
        })
    } catch (error) {
        handleError(res, error, "Lỗi khi cập nhật số lượng");
    }
}