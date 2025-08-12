/**
 * Tính toán các thông số phân trang.
 *
 * @param {object} objectPagination - Đối tượng phân trang ban đầu, cần có `limitItems`.
 * @param {object} query - Đối tượng query từ request, có thể chứa `page`.
 * @param {number} countRecords - Tổng số bản ghi cần phân trang.
 * @returns {object} Đối tượng phân trang đã được cập nhật với `currentPage`, `skip`, và `totalPage`.
 */
module.exports = (objectPagination, query, countRecords) => {
  // Đảm bảo limitItems là một số dương để tránh lỗi chia cho 0.
  // Nếu không hợp lệ, mặc định là 10.
  const limitItems = Math.max(1, parseInt(objectPagination.limitItems) || 10);
  objectPagination.limitItems = limitItems;

  // Xác thực và lấy trang hiện tại từ query, mặc định là 1.
  let currentPage = 1;
  if (query.page) {
    const pageNumber = parseInt(query.page);
    if (!isNaN(pageNumber) && pageNumber > 0) {
      currentPage = pageNumber;
    }
  }
  objectPagination.currentPage = currentPage;

  // Tính toán số lượng bản ghi cần bỏ qua.
  objectPagination.skip = (currentPage - 1) * limitItems;

  // Tính toán tổng số trang.
  const totalPage = Math.ceil(countRecords / limitItems);
  objectPagination.totalPage = totalPage;

  return objectPagination;
};
