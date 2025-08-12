const Cart = require("../models/cart.models");
const Product = require("../models/productmodel");
const productHelper = require("../../helpers/product.helper");
const handleError = require("../../helpers/handleError");
const Order = require("../models/order.model");

module.exports.index = async (req, res) => {
    try {
        const cartId = req.cookie.cartId;
        const cart = await Cart.findOne({
            _id: cartId,
        });
        if(!cart || cart.products.length === 0) {
            res.json({
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
module.exports.order = async (req, res) => {
  try {
    const cartId = req.cookies.cartId; 
    const userInfo = req.body;

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
        discountPercentage: productInfo.discountPercentage,
        quantity: item.quantity,
      };

      products.push(objectProduct);
    }

    const objectOrder = {
      cart_id: cartId,
      userInfo: userInfo,
      products: products,
    };

    const order = new Order(objectOrder);
    await order.save();

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
module.exports.success = async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.orderId,
        }).lean();
        if(!order || !Array.isArray(order.products)){
            return res.json({
                code: 400,
                message: "Đơn hàng không tồn tại hoặc bị lỗi",
            })
        }
        for(const product of order.products) {
            const productInfo = await Product.findOne({
                _id: product.product_id,
            }).selected("title thumbnail");
            product.productInfo = productInfo;
            product.priceNew = (product.price * (100 - product.discountPercentage)) / 100;
            product.totalPrice = product.priceNew * product.quantity;
        }
        order.totalPrice = order.products.reduce((sum, item) => sum + item.totalPrice, 0);
        res.json({
            code:400,
            message: "Đặt hàng thành công",
            data: order,
        })
    } catch (error) {
        handleError(res, error, "Lỗi khi đặt hàng thành công");
    }
}