const mongoose = require("mongoose");

const rolesSchema = new mongoose.Schema(
    {
        title: String,
        description: String,
        permissions: {
            type: Array,
            default: []
        },
        deleted: {
            type: Boolean,
            default: false,
        },
        deleteAt: Date,
    },
    {
        timestamps: true,
    
    }
)
const Roles = mongoose.model("roles", rolesSchema, "roles");

module.exports = Roles;