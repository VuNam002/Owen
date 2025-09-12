import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { PaginationComponent } from "../../../helpers/pagination";
import { MdAttachMoney, MdFavorite, MdFavoriteBorder } from "react-icons/md";
import { FiGrid, FiFilter } from "react-icons/fi";

interface Product {
  _id: string;
  title: string;
  price: number;
  thumbnail: string;
  priceNew?: number;
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get("page") || "1"));
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(6);
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get("category") || "");
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  const calculateDiscountedPrice = (originalPrice: number, discountPercentage: number): number => {
    if (!discountPercentage || discountPercentage <= 0) return originalPrice;
    return originalPrice - (originalPrice * discountPercentage) / 100;
  };

  const hasDiscount = (product: Product): boolean => {
    return !!(product.discountPercentage && product.discountPercentage > 0);
  };

  const calculateSavings = (originalPrice: number, discountPercentage: number): number => {
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
        setCategories(categoriesData.filter(cat => cat.status === "active"));
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
    const params = new URLSearchParams();
    params.append("page", currentPage.toString());
    params.append("limit", itemsPerPage.toString());
    if (selectedCategory) {
      params.append("category", selectedCategory);
    }
    
    // Use the correct endpoint that supports filtering
    const url = `http://localhost:3000/api/v1/home?${params.toString()}`;

    fetch(url)
      .then((response) => response.json())
      .then((result) => {
        const data: Product[] = result.data.products || result.data || [];
        setProducts(data);
        const totalPagesFromApi = result.pagination?.totalPage || 1;
        setTotalPages(totalPagesFromApi);
        const totalItemsFromApi = result.pagination?.totalItems || result.totalProducts || 0;
        setTotalItems(totalItemsFromApi);
        setLoading(false);
      })
      .catch((error) => {
        console.error("API Error:", error);
        setLoading(false);
      });
  }, [currentPage, selectedCategory, itemsPerPage]);

  const updateURLParams = (key: string, value: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (value) {
      newSearchParams.set(key, value);
    } else {
      newSearchParams.delete(key);
    }
    setSearchParams(newSearchParams);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateURLParams("page", page.toString());
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
    updateURLParams("category", categoryId);
    updateURLParams("page", "1");
    setShowFilter(false);
  };

  const handleShowAll = () => {
    setSelectedCategory("");
    setCurrentPage(1);
    updateURLParams("category", "");
    updateURLParams("page", "1");
    setShowFilter(false);
  };

  const selectedCategoryObject = categories.find(cat => cat._id === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container px-4 py-4 mx-auto">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">Thời Trang</h1>
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="flex items-center gap-2 px-3 py-2 text-sm transition-colors bg-gray-100 rounded-lg md:hidden hover:bg-gray-200"
            >
              <FiFilter className="w-4 h-4" />
              {showFilter ? 'Ẩn' : 'Lọc'}
            </button>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
            <Link to="/" className="cursor-pointer hover:text-gray-700">Trang chủ</Link>
            <span>/</span>
            <span className="cursor-pointer hover:text-gray-700">Sản phẩm</span>
            {selectedCategoryObject && (
              <>
                <span>/</span>
                <span className="font-medium text-[#DCB963] break-words">
                  {selectedCategoryObject.title}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="container px-4 py-6 mx-auto">
        <div className="flex gap-6">
          <div className={`${showFilter ? 'fixed inset-0 z-50 bg-black bg-opacity-50 md:relative md:bg-transparent' : 'hidden'} md:block md:w-64 md:flex-shrink-0`}>
            <div className={`${showFilter ? 'fixed left-0 top-0 h-full w-80 bg-white shadow-lg overflow-y-auto' : ''} md:sticky md:top-8 md:w-64 md:shadow-none`}>
              {showFilter && (
                <div className="flex items-center justify-between p-4 border-b md:hidden">
                  <h3 className="font-medium">Danh mục</h3>
                  <button onClick={() => setShowFilter(false)} className="text-gray-500">✕</button>
                </div>
              )}
              
              <div className="p-4 space-y-1 md:p-0">
                <button
                  onClick={handleShowAll}
                  className={`w-full text-left px-0 py-3 text-sm font-medium transition-colors ${
                    !selectedCategory ? "text-gray-900 border-b border-gray-300" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Tất cả sản phẩm
                </button>

                {categories.map((category) => (
                  <button
                    key={category._id}
                    onClick={() => handleCategoryClick(category._id)}
                    className={`w-full text-left px-0 py-3 text-sm font-medium transition-colors ${
                      selectedCategory === category._id
                        ? "text-gray-900 border-b border-gray-300"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {category.title}
                  </button>
                ))}

                {loadingCategories && (
                  <div className="py-8 text-center">
                    <div className="w-6 h-6 mx-auto border-2 border-gray-300 rounded-full animate-spin border-t-gray-900"></div>
                    <p className="mt-2 text-sm text-gray-500">Đang tải...</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-4 border-4 border-gray-200 rounded-full animate-spin border-t-blue-500"></div>
                  <p className="text-gray-500">Đang tải...</p>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 mb-8 sm:gap-4 md:grid-cols-3 lg:grid-cols-3">
                  {products.map((product) => (
                    <Link
                      key={product._id}
                      to={`/products/detail/${product._id}`}
                      className="block transition-transform duration-200 "
                    >
                      <div className="overflow-hidden transition-all duration-300 bg-white shadow-sm group">
                        <div className="relative overflow-hidden aspect-[3/4]">
                          <img
                            src={product.thumbnail}
                            alt={product.title}
                            className="object-cover w-full h-full transition-transform duration-300 "
                          />

                          {hasDiscount(product) && (
                            <span className="absolute px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-md top-2 left-2">
                              -{product.discountPercentage}%
                            </span>
                          )}

                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleFavorite(product._id);
                            }}
                            className="absolute p-2 transition-opacity bg-white rounded-full shadow-md opacity-0 top-2 right-2 group-hover:opacity-100"
                          >
                            {favorites.includes(product._id) ? (
                              <MdFavorite className="w-4 h-4 text-red-500" />
                            ) : (
                              <MdFavoriteBorder className="w-4 h-4 text-gray-600" />
                            )}
                          </button>
                        </div>

                        <div className="p-3">
                          <h3 className="mb-2 text-sm font-medium text-gray-900 line-clamp-2 md:text-base">
                            {product.title}
                          </h3>

                          {hasDiscount(product) ? (
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-1">
                                <span className="text-sm font-bold text-red-600 md:text-base">
                                  {calculateDiscountedPrice(product.price, product.discountPercentage!).toLocaleString("vi-VN")}₫
                                </span>
                                <span className="text-xs text-gray-400 line-through md:text-sm">
                                  {product.price.toLocaleString("vi-VN")}₫
                                </span>
                              </div>
                              <div className="px-2 py-1 rounded bg-green-50">
                                <span className="flex items-center gap-1 text-xs font-medium text-green-700">
                                  <MdAttachMoney className="w-3 h-3" />
                                  Tiết kiệm {calculateSavings(product.price, product.discountPercentage!).toLocaleString("vi-VN")}₫
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm font-bold text-gray-900 md:text-base">
                              {product.price.toLocaleString("vi-VN")}₫
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {products.length === 0 && (
                  <div className="py-20 text-center">
                    <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full">
                      <FiGrid className="w-6 h-6 text-gray-400" />
                    </div>
                    <h3 className="mb-2 text-lg font-medium text-gray-900">Không tìm thấy sản phẩm</h3>
                    <p className="mb-4 text-gray-500">Hãy thử tìm kiếm với từ khóa khác hoặc đổi danh mục.</p>
                    {selectedCategory && (
                      <button
                        onClick={handleShowAll}
                        className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                      >
                        Xem tất cả sản phẩm
                      </button>
                    )}
                  </div>
                )}

                {products.length > 0 && (
                  <div className="py-6 mt-8">
                    <div className="max-w-4xl mx-auto">
                      <PaginationComponent
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        itemsPerPage={itemsPerPage}
                        totalItems={totalItems}
                      />
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
