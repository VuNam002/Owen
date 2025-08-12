const productRoutes = require("../admin/productRoutes")
const categoryRoutes = require("../admin/productCategoeyRouters")
const roleSRoutes = require("../admin/rolesRouters")
const articleCategoryRoutes = require("../admin/articleCategoryRouters")
const articeRoutes = require("../admin/articleRoutes")
const accountRoutes = require("../admin/accountRoute")
const myAccountRoutes = require("../admin/my-accountRoute")
const authRoutes = require("../admin/authRoute")


module.exports = (app) => {
    //admin
    const version = "/api/v1";
    app.use(version + "/products", productRoutes);
    app.use(version + "/categorys", categoryRoutes);
    app.use(version + "/roles", roleSRoutes);
    app.use(version + "/article-category", articleCategoryRoutes);
    app.use(version + "/article", articeRoutes)
    app.use(version + "/accounts", accountRoutes);
    app.use(version + "/my-account", myAccountRoutes);
    app.use(version + "/auth", authRoutes);

};