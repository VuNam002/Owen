const productRoutes = require("../admin/productRoutes");
const categoryRoutes = require("../admin/productCategoeyRouters");
const roleSRoutes = require("../admin/rolesRouters");
const articleCategoryRoutes = require("../admin/articleCategoryRouters");
const articeRoutes = require("../admin/articleRoutes");
const accountRoutes = require("../admin/accountRoute");
const myAccountRoutes = require("../admin/my-accountRoute");
const authRoutes = require("../admin/authRoute");
const cartRoutes = require("../admin/cartRoute");
const checkoutRoutes = require("../admin/checkoutRoute");
const homeRoutes = require("../admin/homeRoute");
const userRoutes = require("../admin/userRoute");
const commentRoutes = require("../admin/commentRoute");



module.exports = (app) => {
    //admin
    const version = "/api/v1";
    app.use(version + "/products", productRoutes);
    app.use(version + "/categorys", categoryRoutes);
    app.use(version + "/roles", roleSRoutes);
    app.use(version + "/article-category", articleCategoryRoutes);
    app.use(version + "/article", articeRoutes);
    app.use(version + "/accounts", accountRoutes);
    app.use(version + "/my-account", myAccountRoutes);
    app.use(version + "/auth", authRoutes);
    app.use(version + "/carts", cartRoutes);
    app.use(version + "/checkout", checkoutRoutes);
    app.use(version + "/home", homeRoutes);
    app.use(version + "/users", userRoutes);
    app.use(version + "/comments", commentRoutes);
};