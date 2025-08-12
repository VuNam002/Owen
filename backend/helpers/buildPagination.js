const buildPagination = async (req, filter, Product, paginationHelper) => {
  const initPagination = {
    currentPage: 1,
    limitItems: parseInt(req.query.limit) || (await Product.countDocuments(filter)),
  };
  const totalItems = await Product.countDocuments(filter);
  return paginationHelper(initPagination, req.query, totalItems);
};
module.exports = buildPagination;