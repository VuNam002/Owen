const Cart = require("../models/cart.models");
const Product = require("../models/productmodel");
const productHelper = require("../../helpers/product.helper");
const handleError = require("../../helpers/handleError");
const Order = require("../models/order.model");

// GET /api/v1/checkout - Lấy thông tin giỏ hàng
// module.exports.index = async (req, res) => {
//     try {
//         const cartId = req.cookies.cartId; // Fixed: req.cookies thay vì req.cookie
        
//         if (!cartId) {
//             return res.json({
//                 code: 400,
//                 message: "Không tìm thấy giỏ hàng",
//                 data: {
//                     products: [],
//                     totalPrice: 0,
//                 }
//             });
//         }

//         const cart = await Cart.findOne({
//             _id: cartId,
//         });

//         if (!cart || cart.products.length === 0) {
//             return res.json({
//                 code: 200,
//                 message: "Giỏ hàng trống",
//                 data: {
//                     products: [],
//                     totalPrice: 0,
//                 }
//             });
//         }

//         // Populate thông tin sản phẩm
//         for (const item of cart.products) {
//             const productInfo = await Product.findOne({
//                 _id: item.product_id,
//                 deleted: false,
//                 status: "active",
//             });
            
//             if (productInfo) {
//                 productInfo.priceNew = productHelper.calcNewPrice([productInfo])[0].priceNew;
//                 item.productInfo = productInfo;
//                 item.totalPrice = item.quantity * item.productInfo.priceNew;
//             }
//         }

//         // Filter ra các sản phẩm không hợp lệ
//         cart.products = cart.products.filter(item => item.productInfo);
//         cart.totalPrice = cart.products.reduce((sum, item) => sum + item.totalPrice, 0);

//         res.json({
//             code: 200,
//             message: "Lấy danh sách sản phẩm thành công",
//             data: cart,
//         });
//     } catch (error) {
//         handleError(res, error, "Lỗi khi lấy danh sách sản phẩm");
//     }
// };

// POST /api/v1/checkout/order - Tạo đơn hàng
module.exports.order = async (req, res) => {
    try {
        const { cartId, userInfo } = req.body;

        if (!cartId) {
            return res.json({
                code: 400,
                message: "Không tìm thấy giỏ hàng (cartId is missing)",
            });
        }

        const cart = await Cart.findOne({ _id: cartId });

        if (!cart || cart.products.length === 0) {
            return res.json({
                code: 400,
                message: "Giỏ hàng trống, không thể đặt hàng",
            });
        }

        let products = [];

        for (const item of cart.products) {
            const productInfo = await Product.findOne({
                _id: item.product_id,
                deleted: false,
                status: "active",
            });

            if (!productInfo) {
                return res.json({
                    code: 400,
                    message: `Sản phẩm có ID ${item.product_id} không hợp lệ`,
                });
            }

            if (productInfo.stock < item.quantity) {
                return res.json({
                    code: 400,
                    message: `Sản phẩm "${productInfo.title}" không đủ số lượng`,
                });
            }

            const objectProduct = {
                product_id: item.product_id,
                price: productInfo.price,
                discountPercentage: productInfo.discountPercentage || 0,
                quantity: item.quantity,
            };

            products.push(objectProduct);
        }

                const objectOrder = {
            cart_id: cartId,
            userInfo: userInfo,
            products: products,
            status: "pending",
        };

        const order = new Order(objectOrder);
        await order.save();
        console.log("Order created:", order);

        // Cập nhật số lượng sản phẩm trong kho

        for (const item of products) {
            await Product.updateOne(
                { _id: item.product_id },
                { $inc: { stock: -item.quantity } }
            );
        }

        await Cart.updateOne({ _id: cartId }, { products: [] });

        res.json({
            code: 200,
            message: "Đặt hàng thành công",
            data: order,
        });
    } catch (error) {
        handleError(res, error, "Lỗi khi đặt hàng");
    }
};

// GET /api/v1/checkout/success/:orderId - Lấy thông tin đơn hàng thành công
module.exports.success = async (req, res) => {
    try {
        const orderId = req.params.orderId;

        if (!orderId) {
            return res.json({
                code: 400,
                message: "Không tìm thấy mã đơn hàng",
            });
        }

        const order = await Order.findOne({
            _id: orderId,
        }).lean();

        if (!order || !Array.isArray(order.products)) {
            return res.json({
                code: 400,
                message: "Đơn hàng không tồn tại hoặc bị lỗi",
            });
        }

        // Populate thông tin sản phẩm
        for (const product of order.products) {
            const productInfo = await Product.findOne({
                _id: product.product_id,
            }).select("title thumbnail"); // Fixed: select thay vì selected

            if (productInfo) {
                product.productInfo = productInfo;
                product.priceNew = (product.price * (100 - product.discountPercentage)) / 100;
                product.totalPrice = product.priceNew * product.quantity;
            }
        }

        // Tính tổng tiền đơn hàng
        order.totalPrice = order.products.reduce((sum, item) => sum + item.totalPrice, 0);

        res.json({
            code: 200,
            message: "Lấy thông tin đơn hàng thành công",
            data: order, // Trả về order trong data
        });
    } catch (error) {
        handleError(res, error, "Lỗi khi lấy thông tin đơn hàng");
    }
};

// GET /api/v1/checkout/orders - Lấy danh sách tất cả đơn hàng
module.exports.index = async (req, res) => {
    try {
        const orders = await Order.find({}).lean();

        if (!orders || orders.length === 0) {
            return res.json({
                code: 200,
                message: "Không có đơn hàng nào",
                data: []
            });
        }

        // Populate thông tin sản phẩm cho từng đơn hàng
        for (const order of orders) {
            if (Array.isArray(order.products)) {
                for (const product of order.products) {
                    const productInfo = await Product.findOne({
                        _id: product.product_id,
                    }).select("title thumbnail");

                    if (productInfo) {
                        product.productInfo = productInfo;
                        product.priceNew = (product.price * (100 - product.discountPercentage)) / 100;
                        product.totalPrice = product.priceNew * product.quantity;
                    }
                }

                // Tính tổng tiền đơn hàng
                order.totalPrice = order.products.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
            }
        }

        res.json({
            code: 200,
            message: "Lấy danh sách đơn hàng thành công",
            data: orders,
        });

    } catch (error) {
        handleError(res, error, "Lỗi khi lấy danh sách đơn hàng");
    }
};