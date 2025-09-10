const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema({
    cart_id: String,
    user_id: String,
    status: String,
    userInfo: {
            fullName: String,
            phone: String,
            address: String,
    },
    products: [
        {
            product_id: String,
            quantity: Number,
            discountPercentage: Number,
            price: Number,
        }
    ]
}, {
    timestamps: true,
})
const Order = mongoose.model("Order", orderSchema, "order");

module.exports = Order;