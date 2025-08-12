const buildSearchFilter = async (objectSearch, Category) => {
  const filter = {
    status: "active", 
    deleted: { $ne: true },
  };

  if (objectSearch.keyword) {
    const keywordRegex = new RegExp(
      objectSearch.keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "i"
    );
    const matchingCategories = await Category.find({ title: keywordRegex }).select('_id');
    const categoryIds = matchingCategories.map(cat => cat._id);
    const orConditions = [{ title: keywordRegex }];
    if (categoryIds.length > 0) {
      orConditions.push({ category: { $in: categoryIds } });
    }
    filter.$or = orConditions;
  }
  return filter;
};
module.exports = buildSearchFilter;