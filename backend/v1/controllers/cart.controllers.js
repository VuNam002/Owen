const Cart = require("../models/cart.models");
const Product = require("../models/productmodel");
const productHelper = require("../../helpers/product.helper");
const handleError = require("../../helpers/handleError")

module.exports.addPost = async (req, res) => {
    try {
        const cartId = req.cookies.cartId;
        const productId = req.params.productId;
        const quantity = parseInt(req.body.quantity) || 1;

        const product = await Product.findOne({
            _id: productId,
            deleted: false,
            status: "active",
        });

        if(!product) {
            return res.status(404).json({
                code: 404,
                message: "Không tìm thấy sản phẩm"
            });
        }

        let cart;
        if (cartId) {
            cart = await Cart.findById(cartId);
        }

        if (!cart) {
            cart = new Cart();
            // Set the new cart ID in the cookie
            res.cookie("cartId", cart._id.toString(), {
                expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            });
        }

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
        });
    } catch (error) {
        handleError(res, error, "Lỗi khi thêm vào giỏ hàng");
    }
}
module.exports.index = async (req, res) => {
    try {
        const cartId = req.cookies.cartId;
        const cart = await Cart.findById(cartId);

        if (!cart || cart.products.length === 0) {
            return res.json({
                code: 200,
                message: "Giỏ hàng trống",
                data: { products: [], totalPrice: 0 }
            });
        }

        const productIds = cart.products.map(item => item.product_id);

        const products = await Product.find({
            _id: { $in: productIds },
            deleted: false,
            status: "active"
        }).select("title thumbnail description price discountPercentage status");

        const productsMap = new Map(products.map(p => [p._id.toString(), p]));

        let totalCartPrice = 0;

        const detailedProducts = cart.products.map(item => {
            const productInfo = productsMap.get(item.product_id.toString());
            if (productInfo) {
                const priceNew = productHelper.calcNewPrice([productInfo])[0].priceNew;
                const totalPrice = priceNew * item.quantity;
                totalCartPrice += totalPrice;

                const leanProductInfo = {
                    _id: productInfo._id,
                    title: productInfo.title,
                    thumbnail: productInfo.thumbnail,
                    description: productInfo.description,
                    priceNew: priceNew
                };

                return {
                    ...item.toObject(),
                    productInfo: leanProductInfo,
                    totalPrice: totalPrice
                };
            }
            return null;
        }).filter(Boolean);

        const responseData = {
            ...cart.toObject(),
            products: detailedProducts,
            totalPrice: totalCartPrice
        };

        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        res.json({
            code: 200,
            message: "Lấy danh sách sản phẩm thành công",
            data: responseData,
        });

    } catch (error) {
        handleError(res, error, "Lỗi khi lấy danh sách sản phẩm");
    }
}
module.exports.delete = async (req, res) => {
    try {
        const cartId = req.cookies.cartId;
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
        const cartId = req.cookies.cartId;
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