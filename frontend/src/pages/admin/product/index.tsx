import { useState } from "react";
import { useProducts } from "../../../hooks/useProducts";
import { ProductFilters } from "../../../components/Products/ProductFilters ";
import { ProductActions } from "../../../components/Products/ProductActions";
import { Pagination } from "../../../components/Products/Pagination";
import { ErrorAlert } from "../../../components/ErrorAlert/ErrorAlert";

function Products() {
  const {
    loading,
    error,
    setError, 
    paginatedProducts,
    totalItems,
    totalPages,
    currentPage,
    startIndex,
    endIndex,
    keyword,
    setKeyword,
    filterStatus,
    setFilterStatus,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    selectedProducts,
    selectAll,
    handleSelectProduct,
    handleSelectAll,
    handlePageChange,
    handlePrePage,
    handleNextPage,
    handleStatusChange,
    handlePositionChange,
    handleSavePosition,
    handleDeleteProduct,
    positions,
    handleBulkDelete,
  } = useProducts();

  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDateTime = (dateString: string) => {
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 bg-gray-50">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Đang tải...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Danh sách sản phẩm</h1>
          <p className="mt-1 text-gray-600">Quản lý sản phẩm của cửa hàng</p>
        </div>

        {/* Error Alert */}
        {error && <ErrorAlert error={error} onClose={() => setError(null)} />}

        {/* Controls */}
        <div className="mb-6 bg-white border border-gray-200 rounded-lg">
          <ProductFilters
            keyword={keyword}
            setKeyword={setKeyword}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
          />

          <ProductActions
            selectedProductsCount={selectedProducts.length}
            onCreateClick={() => setShowCreateModal(true)}
            onBulkDelete={handleBulkDelete}
            onSavePosition={handleSavePosition}
            startIndex={startIndex}
            endIndex={endIndex}
            totalItems={totalItems}
          />
        </div>

        {/* Products Table */}
        <div className="overflow-hidden bg-white border border-gray-200 rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="text-blue-600 border-gray-300 rounded shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                    />
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Vị trí
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Sản phẩm
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Giá
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Danh mục
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Người tạo
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Thời gian tạo
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product._id)}
                        onChange={(e) => handleSelectProduct(product._id, e.target.checked)}
                        className="text-blue-600 border-gray-300 rounded shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        value={positions[product._id] || product.position}
                        onChange={(e) => handlePositionChange(product._id, parseInt(e.target.value) || 0)}
                        className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-12 h-12">
                          <img
                            className="object-cover w-12 h-12 rounded-lg"
                            src={product.thumbnail || '/placeholder-image.jpg'}
                            alt={product.title}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder-image.jpg';
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.title}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                      {/* Hiển thị tên danh mục */}
                      {product.product_category_id?.title || 'Chưa phân loại'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleStatusChange(product._id, product.status)}
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full transition-colors ${
                          product.status === 'active'
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {product.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                      {/* Hiển thị account_id từ createdBy */}
                      {product.createdBy?.account_id || 'Không xác định'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {/* Hiển thị thời gian tạo */}
                      {product.createdAt ? formatDateTime(product.createdAt) : 'Không rõ'}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => window.location.href = `/admin/products/edit/${product._id}`}
                          className="text-blue-600 transition-colors hover:text-blue-900"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product._id)}
                          className="text-red-600 transition-colors hover:text-red-900"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {paginatedProducts.length === 0 && (
            <div className="py-12 text-center">
              <div className="text-gray-500">Không tìm thấy sản phẩm nào</div>
            </div>
          )}
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          onPrevPage={handlePrePage}
          onNextPage={handleNextPage}
        />
      </div>
    </div>
  );
}

export default Products;