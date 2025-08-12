const buildSortObject = (req) => {
  const sortKey = req.query.sortKey || "createdAt";
  const sortValue = req.query.sortValue === "asc" ? 1 : -1;
  const sort = {};
  sort[sortKey] = sortValue;
  return sort;
};
module.exports = buildSortObject;