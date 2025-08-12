const ArticleCategory = require("../v1/models/article-category.models");

const getSubCategory = async (parentId) => {
  const subs = await ArticleCategory.find({
    parent_id: parentId,
    status: "active",
    deleted: false,
  });

let allSub = [...subs];
for(const sub of subs) {
  const childs = await getSubCategory(sub.id);
  allSub = allSub.concat(childs)
}

return allSub;
}

module.exports.getSubCategory = getSubCategory;