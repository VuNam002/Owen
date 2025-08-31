import { useEffect, useState } from "react";
import { PaginationComponent } from "../../../helpers/pagination";
import { MdAttachMoney, MdFavorite, MdFavoriteBorder } from "react-icons/md";
import { FiGrid, FiList } from "react-icons/fi";

interface Product {
  _id: string;
  title: string;
  price: number;
  thumbnail: string;
  oldPrice?: number;
  discountPercentage?: number;
  status: string;
  product_category_id: {
    _id: string;
    title: string;
  };
}

interface Category {
  _id: string;
  title: string;
  slug?: string;
  productCount?: number;
  name: string;
  status: string;
}

function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(6);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilter] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);

  const calculateDiscountedPrice = (
    originalPrice: number,
    discountPercentage: number
  ): number => {
    if (!discountPercentage || discountPercentage <= 0) return originalPrice;
    return originalPrice - (originalPrice * discountPercentage) / 100;
  };

  const hasDiscount = (product: Product): boolean => {
    return !!(product.discountPercentage && product.discountPercentage > 0);
  };

  const calculateSavings = (
    originalPrice: number,
    discountPercentage: number
  ): number => {
    if (!discountPercentage || discountPercentage <= 0) return 0;
    return (originalPrice * discountPercentage) / 100;
  };

  const toggleFavorite = (productId: string) => {
    setFavorites((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  // Fetch categories
  useEffect(() => {
    setLoadingCategories(true);
    fetch("http://localhost:3000/api/v1/categorys")
      .then((response) => response.json())
      .then((result) => {
        const categoriesData: Category[] = result.data || [];
        setCategories(categoriesData);
        setLoadingCategories(false);
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
        setLoadingCategories(false);
      });
  }, []);

  // Fetch products
  useEffect(() => {
    setLoading(true);

    let url = `http://localhost:3000/api/v1/products?page=${currentPage}&limit=${itemsPerPage}`;
    if (selectedCategory) {
      url += `&product_category_id=${encodeURIComponent(selectedCategory)}`;
    }

    fetch(url)
      .then((response) => response.json())
      .then((result) => {
        const data: Product[] = result.data || [];
        setProducts(data);

        let calculatedTotalPages = 1;
        let calculatedTotalItems = data.length;

        if (result.totalPages) {
          calculatedTotalPages = result.totalPages;
        } else if (result.pagination?.totalPages) {
          calculatedTotalPages = result.pagination.totalPages;
        }

        if (result.totalItems) {
          calculatedTotalItems = result.totalItems;
        } else if (result.pagination?.totalItems) {
          calculatedTotalItems = result.pagination.totalItems;
        } else if (result.total) {
          calculatedTotalItems = result.total;
        }

        if (calculatedTotalItems > itemsPerPage) {
          calculatedTotalPages = Math.ceil(calculatedTotalItems / itemsPerPage);
        }

        if (data.length === itemsPerPage && calculatedTotalPages === 1) {
          calculatedTotalPages = currentPage + 1;
        }

        setTotalPages(calculatedTotalPages);
        setLoading(false);
      })
      .catch((error) => {
        console.error("API Error:", error);
        setLoading(false);
      });
  }, [currentPage, selectedCategory, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCategoryClick = (categoryTitle: string) => {
    setSelectedCategory(categoryTitle);
    setCurrentPage(1);
  };

  const handleShowAll = () => {
    setSelectedCategory("");
    setCurrentPage(1);
  };

  const activeCategories = categories.filter(
    (category) => category.status === "active"
  );

  const filteredProducts = selectedCategory
    ? products.filter(
        (product) => product.product_category_id?.title === selectedCategory
      )
    : products;

  const activeProducts = filteredProducts.filter((p) => p.status === "active");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b">
        <div className="container px-4 py-6 mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="mb-2 text-3xl font-bold text-gray-900">
                  Thời Trang
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex overflow-hidden border rounded-lg">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 ${
                    viewMode === "grid"
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <FiGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 ${
                    viewMode === "list"
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <FiList className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Trang chủ</span>
            <span>/</span>
            <span>Sản phẩm</span>
            {selectedCategory && (
              <>
                <span>/</span>
                <span className="font-medium text-gray-900">
                  {selectedCategory}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="container px-4 py-8 mx-auto">
        <div className="flex">
          {/* Sidebar */}
          {showFilter && (
            <div className="flex-shrink-0 w-80">
              <div className="sticky p-6 top-8">
                <div className="space-y-3">
                  <button
                    onClick={handleShowAll}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                      !selectedCategory
                        ? "text-[#DCB963]"
                        : "text-gray-700 hover:text-[#DCB963]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>Tất cả sản phẩm</span>
                    </div>
                  </button>

                  {/* Chỉ hiển thị categories có status là "active" */}
                  {activeCategories.map((category) => (
                    <button
                      key={category._id}
                      onClick={() => handleCategoryClick(category.title)}
                      className={`w-full text-left px-4 py-3 transition-all duration-300 ${
                        selectedCategory === category.title
                          ? "text-[#DCB963]"
                          : "text-gray-700 hover:text-[#DCB963]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{category.title}</span>
                        {category.productCount && (
                          <span className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded-full">
                            {category.productCount}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {loadingCategories && (
                  <div className="py-4 text-center">
                    <div className="w-8 h-8 mx-auto border-b-2 border-blue-500 rounded-full animate-spin"></div>
                    <p className="mt-2 text-sm text-gray-500">
                      Đang tải danh mục...
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {!loading && activeProducts.length > 0 && (
              <div className="flex items-center justify-between ">
                {selectedCategory && (
                  <span className="ml-2">
                    trong danh mục{" "}
                    <span className="font-medium text-[#DCB963]">
                      {selectedCategory}
                    </span>
                  </span>
                )}
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="mx-auto mb-4 border-b-2 border-blue-500 rounded-full w-14 h-14 animate-spin"></div>
                  <p className="text-gray-500">Đang tải sản phẩm...</p>
                </div>
              </div>
            ) : (
              <>
                <div
                  className={`grid gap-6 mb-8 ${
                    viewMode === "grid"
                      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3"
                      : "grid-cols-1"
                  }`}
                >
                  {activeProducts.map((product) => (
                    <div
                      key={product._id}
                      className={`bg-white shadow-sm transition-all duration-300 group overflow-hidden ${
                        viewMode === "list" ? "flex" : ""
                      }`}
                    >
                      <div
                        className={`relative overflow-hidden ${
                          viewMode === "list"
                            ? "w-[370px] h-[494px]"
                            : "w-[370px] h-[494px]"
                        }`}
                      >
                        <img
                          src={product.thumbnail}
                          alt={product.title}
                          className="object-cover w-full h-full transition-transform duration-300 "
                        />

                        <div className="absolute flex flex-col gap-2 top-3 left-3">
                          {hasDiscount(product) && (
                            <span className="px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-md">
                              -{product.discountPercentage}%
                            </span>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="absolute flex flex-col gap-2 transition-opacity duration-200 opacity-0 top-3 right-3 group-hover:opacity-100">
                          <button
                            onClick={() => toggleFavorite(product._id)}
                            className="p-2 transition-colors bg-white rounded-full shadow-md hover:bg-red-50"
                          >
                            {favorites.includes(product._id) ? (
                              <MdFavorite className="w-4 h-4 text-red-500" />
                            ) : (
                              <MdFavoriteBorder className="w-4 h-4 text-gray-600" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div
                        className={`p-4 ${viewMode === "list" ? "flex-1" : ""}`}
                      >
                        <div className="mb-3">
                          <h3 className="font-medium text-gray-900 transition-colors cursor-pointer line-clamp-2 hover:text-blue-600">
                            {product.title}
                          </h3>
                        </div>

                        <div className="space-y-3">
                          {hasDiscount(product) ? (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-red-600">
                                  {calculateDiscountedPrice(
                                    product.price,
                                    product.discountPercentage!
                                  ).toLocaleString("vi-VN")}
                                  ₫
                                </span>
                                <span className="text-sm text-gray-400 line-through">
                                  {product.price.toLocaleString("vi-VN")}₫
                                </span>
                              </div>
                              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-green-50">
                                <span className="flex items-center gap-1 text-xs font-medium text-green-700">
                                  <MdAttachMoney className="w-3 h-3" />
                                  Tiết kiệm{" "}
                                  {calculateSavings(
                                    product.price,
                                    product.discountPercentage!
                                  ).toLocaleString("vi-VN")}
                                  ₫
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="text-lg font-bold text-gray-900">
                              {product.price.toLocaleString("vi-VN")}₫
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {activeProducts.length === 0 && (
                  <div className="py-20 text-center">
                    <div className="flex items-center justify-center w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full">
                      <FiGrid className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="mb-2 text-lg font-medium text-gray-900">
                      Không tìm thấy sản phẩm nào
                    </h3>
                    <p className="mb-4 text-gray-500">
                      Hãy thử tìm kiếm với từ khóa khác hoặc xem tất cả sản phẩm
                    </p>
                    {selectedCategory && (
                      <button
                        onClick={handleShowAll}
                        className="px-6 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                      >
                        Xem tất cả sản phẩm
                      </button>
                    )}
                  </div>
                )}

                {activeProducts.length > 0 && (
                  <div className="py-8 mt-12">
                    <div className="max-w-4xl mx-auto">
                      <div className="flex justify-center mb-4">
                        <PaginationComponent
                          currentPage={currentPage}
                          totalPages={Math.max(
                            totalPages,
                            activeProducts.length === itemsPerPage
                              ? currentPage + 1
                              : 1
                          )}
                          onPageChange={handlePageChange}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Products;
