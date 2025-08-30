import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import PaginationComponent from "../../../helpers/pagination";


interface Product {
  _id: string;
  title: string;
  price: number;
  description?: string;
  thumbnail?: string;
  discountPercentage: number;
  product_category_id?: {
    _id: string;
    title: string;
  };
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: Product[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limitItems: number;
  };
}

function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState<any>(null);

  const keyword = searchParams.get("keyword") || "";
  const currentPage = searchParams.get("page") || "1";

  useEffect(() => {
    if (!keyword) {
      navigate("/products"); 
      return;
    }

    const fetchSearchResults = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `http://localhost:3000/api/v1/products?keyword=${encodeURIComponent(keyword)}&page=${currentPage}&limit=12`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ApiResponse = await response.json();

        if (data.success) {
          setProducts(data.data);
          setPagination(data.pagination);
        } else {
          setError(data.message || "Có lỗi xảy ra khi tìm kiếm");
        }
      } catch (err) {
        console.error("Search error:", err);
        setError("Không thể kết nối đến server");
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [keyword, currentPage, navigate]);

  const handlePageChange = (page: number) => {
    setSearchParams({
      keyword: keyword,
      page: page.toString(),
    });
  };

  if (loading) {
    return (
      <div className="container px-4 py-8 mx-auto">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-lg text-gray-600">Đang tìm kiếm...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-gray-800">
          Kết quả tìm kiếm cho: "{keyword}"
        </h1>
        {pagination && (
          <p className="mt-2 text-gray-600">
            Tìm thấy {pagination.totalItems} sản phẩm
          </p>
        )}
      </div>

      {error && (
        <div className="px-4 py-3 mb-6 text-red-700 border border-red-200 rounded bg-red-50">
          {error}
        </div>
      )}

      {products.length === 0 && !loading && !error && (
        <div className="py-12 text-center">
          <div className="mb-4 text-lg text-gray-500">
            Không tìm thấy sản phẩm nào phù hợp
          </div>
          <button
            onClick={() => navigate("/products")}
            className="px-6 py-2 text-white transition-colors bg-blue-500 rounded hover:bg-blue-600"
          >
            Xem tất cả sản phẩm
          </button>
        </div>
      )}

      {products.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => {
              const discountedPrice = product.price * (1 - product.discountPercentage / 100);

              return (
                <div
                  key={product._id}
                  className="relative overflow-hidden transition-shadow duration-200 bg-white border shadow-sm hover:shadow-md"
                >
                  {product.discountPercentage > 0 && (
                    <div className="absolute z-10 px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded-md top-3 right-3">
                      GIẢM {product.discountPercentage}%
                    </div>
                  )}

                  {product.thumbnail && (
                    <img
                      src={product.thumbnail}
                      alt={product.title}
                      className="object-cover w-[370px] h-[490px]"
                    />
                  )}

                  <div className="p-4">
                    <h3 className="mb-2 text-lg font-semibold text-gray-800 line-clamp-2">
                      {product.title}
                    </h3>

                    {product.description && (
                      <p className="mb-3 text-sm text-gray-600 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    
                    <div className="flex items-end justify-between mt-4">
                      <div className="flex flex-col">
                        {product.discountPercentage > 0 ? (
                          <>
                            <span className="text-lg font-bold text-red-600">
                              {discountedPrice.toLocaleString("vi-VN", { style: 'currency', currency: 'VND' })}
                            </span>
                            <span className="text-sm text-gray-500 line-through">
                              {product.price.toLocaleString("vi-VN", { style: 'currency', currency: 'VND' })}
                            </span>
                          </>
                        ) : (
                          <span className="text-lg font-bold text-blue-600">
                            {product.price.toLocaleString("vi-VN", { style: 'currency', currency: 'VND' })}
                          </span>
                        )}
                      </div>

                      {product.product_category_id && (
                        <span className="px-2 py-1 text-xs text-gray-500 bg-gray-100 rounded">
                          {product.product_category_id.title}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <PaginationComponent
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
}

export default SearchResultsPage;