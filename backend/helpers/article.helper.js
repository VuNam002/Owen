const Article = require("../v1/models/articles.models");

/**
 * Lấy danh sách bài viết nổi bật.
 * @param {number} limit - Số lượng bài viết cần lấy.
 * @returns {Promise<Article[]>}
 */
const getFeaturedArticles = (limit = 5) => {
  return Article.find({
    featured: "1",
    deleted: false,
    status: "active",
  }).sort({ position: "desc" }).limit(limit);
};

const getNewArticles = (limit = 5) => {
  return Article.find({
    deleted: false,
    status: "active",
  }).sort({ createdAt: "desc" }).limit(limit);
};

module.exports = {
  getFeaturedArticles,
  getNewArticles,
};