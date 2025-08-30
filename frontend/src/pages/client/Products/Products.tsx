import { useEffect, useState } from "react";
import { PaginationComponent } from "../../../helpers/pagination";
import { MdAttachMoney } from "react-icons/md";

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
}

function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);

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

    let url = `http://localhost:3000/api/v1/products?page=${currentPage}&limit=10`;
    if (selectedCategory) {
      url += `&product_category_id=${encodeURIComponent(selectedCategory)}`;
    }

    fetch(url)
      .then((response) => response.json())
      .then((result) => {
        const data: Product[] = result.data || [];
        setProducts(data);

        if (result.totalPages) {
          setTotalPages(result.totalPages);
        } else if (result.pagination?.totalPages) {
          setTotalPages(result.pagination.totalPages);
        }

        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [currentPage, selectedCategory]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleCategoryClick = (categoryTitle: string) => {
    setSelectedCategory(categoryTitle);
    setCurrentPage(1);
  };

  const handleShowAll = () => {
    setSelectedCategory("");
    setCurrentPage(1);
  };

  const filteredProducts = selectedCategory
    ? products.filter(
        (product) => product.product_category_id?.title === selectedCategory
      )
    : products;

  const activeProducts = filteredProducts.filter((p) => p.status === "active");

  return (
    <div className="flex gap-6">
      <div className="flex-shrink-0 w-64">
        <div className="p-4 bg-white border border-gray-100 rounded-lg shadow-sm">
          <h3 className="mb-4 font-semibold text-gray-900">DANH MỤC</h3>
          <ul className="space-y-2">
            <li>
              <button
                onClick={handleShowAll}
                className={`text-left w-full px-2 py-1 rounded transition-colors ${
                  !selectedCategory
                    ? "text-blue-600 bg-blue-50 font-medium"
                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                }`}
              >
                TẤT CẢ SẢN PHẨM
              </button>
            </li>

            {/* Danh sách categories */}
            {categories.map((category) => (
              <li key={category._id}>
                <button
                  onClick={() => handleCategoryClick(category.title)}
                  className={`text-left w-full px-2 py-1 rounded transition-colors ${
                    selectedCategory === category.title
                      ? "text-blue-600 bg-blue-50 font-medium"
                      : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  }`}
                >
                  {category.title}
                  {category.productCount && (
                    <span className="ml-2 text-xs text-gray-500">
                      ({category.productCount})
                    </span>
                  )}
                </button>
              </li>
            ))}

            {loadingCategories && (
              <li className="text-sm italic text-gray-400">
                Đang tải danh mục...
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="flex-1">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="relative inline-block text-2xl font-bold text-gray-800">
              Danh sách sản phẩm
              <span className="absolute left-0 w-1/2 h-1 bg-green-500 rounded -bottom-1"></span>
            </h1>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Đang tải sản phẩm...</div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-4 mb-8">
              {activeProducts.map((product) => (
                <div
                  key={product._id}
                  className="overflow-hidden transition-shadow border shadow-sm cursor-pointer "
                >
                  {/* Container cho ảnh và badge giảm giá */}
                  <div className="relative overflow-hidden aspect-square ">
                    <img
                      src={product.thumbnail}
                      alt={product.title}
                      className="object-cover w-full h-full transition-transform duration-300 "
                    />

                    {/* Badge giảm giá */}
                    {hasDiscount(product) && (
                      <div className="absolute top-2 left-2">
                        <span className="inline-block px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-md ">
                          -{product.discountPercentage}%
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h2 className="mb-3 text-sm font-medium text-gray-900 line-clamp-2 hover:text-blue-600">
                      {product.title}
                    </h2>

                    {/* Phần hiển thị giá */}
                    <div className="space-y-2">
                      {/* Giá gốc */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Giá gốc:</span>
                        <span
                          className={`text-sm ${
                            hasDiscount(product)
                              ? "text-gray-400 line-through"
                              : "text-gray-900 font-semibold"
                          }`}
                        >
                          {product.price.toLocaleString("vi-VN")}₫
                        </span>
                      </div>

                      {hasDiscount(product) && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-red-600">
                            Giá khuyến mãi:
                          </span>
                          <span className="text-lg font-bold text-red-600">
                            {calculateDiscountedPrice(
                              product.price,
                              product.discountPercentage!
                            ).toLocaleString("vi-VN")}
                            ₫
                          </span>
                        </div>
                      )}

                      {hasDiscount(product) && (
                        <div className="flex items-center justify-between p-2 rounded bg-green-50">
                          <span className="flex items-center gap-1 text-xs font-medium text-green-700">
                            <MdAttachMoney className="text-sm" />
                            Tiết kiệm:{" "}
                            {calculateSavings(
                              product.price,
                              product.discountPercentage!
                            ).toLocaleString("vi-VN")}
                            ₫
                          </span>
                          <span className="text-xs font-bold text-green-600">
                            (-{product.discountPercentage}%)
                          </span>
                        </div>
                      )}

                      {product.oldPrice &&
                        product.oldPrice !== product.price &&
                        !hasDiscount(product) && (
                          <div className="text-xs text-gray-500">
                            Giá tham khảo:{" "}
                            {product.oldPrice.toLocaleString("vi-VN")}₫
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {activeProducts.length === 0 && (
              <div className="py-12 text-center text-gray-500">
                Không tìm thấy sản phẩm nào
                {selectedCategory && (
                  <div className="mt-2">
                    <button
                      onClick={handleShowAll}
                      className="text-blue-600 hover:underline"
                    >
                      Xem tất cả sản phẩm
                    </button>
                  </div>
                )}
              </div>
            )}
            {totalPages > 1 && (
              <PaginationComponent
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Products;
