const ProductCategory = require("../v1/models/productCategory");

const getSubCategory = async (parentId) => {
  const subs = await ProductCategory.find({
    parent_id: parentId,
    status: "active",
    deleted: false,
  });

  let allSub = [...subs];

  for (const sub of subs) {
    const childs = await getSubCategory(sub._id);
    allSub = allSub.concat(childs);
  }

  return allSub;
};

module.exports.getSubCategory = getSubCategory;