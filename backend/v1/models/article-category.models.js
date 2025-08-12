const mongoose = require("mongoose");
const slug = require("mongoose-slug-updater");
mongoose.plugin(slug);

const articleCategorySchema = new mongoose.Schema(
    {
        title: String,
        parent_id: {
            type: String,
            default: "",
        },
        description: String,
        status: String,
        position: Number,
        featured: String,
        slug: {
            type: String,
            slug:"title",
            unique: true,
        },
        createdBy: {
            account_id: String,
            createdAt: {
                type: Date,
                default: Date.now,
            },
        },
        deleted: {
            type: Boolean,
            default: false,
        },
        thumbnail: String,
        deleteAt: Date,
        deletedBy: {
            account_id: String,
            deletedAt: Date,
        },
    },
    {
        timestamps: true,
    }
)
const ArticleCategory = mongoose.model("ArticleCategory", articleCategorySchema, "article-category");

module.exports = ArticleCategory;