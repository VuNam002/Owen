import { HooksHome } from "../../../hooks/useHome";
import { MdFavorite, MdFavoriteBorder, MdAttachMoney } from "react-icons/md";
import { Link } from "react-router-dom";
import Slide from "../../../components/slide/index";
import Postert from "../../../assets/poster_tre_con.webp"
import Postert_giay from "../../../assets/poster_giay.webp"

// Type definitions (sử dụng từ hook)
interface Product {
  _id: string;
  title: string;
  thumbnail: string;
  price: number;
  priceNew?: number;
  discountPercentage?: number;
}

interface Article {
  _id: string;
  title: string;
  thumbnail?: string;
  description?: string;
  createdAt: string;
  featured?: string;
}

interface Category {
  _id: string;
  title: string;
  slug?: string;
  description?: string;
  products?: Product[];
  totalProducts?: number;
}

interface BrandCount {
  _id: string;
  count: number;
}

const hasDiscount = (product: Product): boolean => {
  return !!(product.discountPercentage && product.discountPercentage > 0);
};

const HomePage = () => {
  const {
    productsFeatured,
    productsNew,
    categories,
    articlesFeatured,
    loading,
    brandCounts,
    error,
    toggleFavorite,
    favorites,
    retry,
    calculateSavings,
  } = HooksHome();

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md p-6 text-center">
          <h2 className="mb-2 text-xl font-semibold text-gray-800">
            Có lỗi xảy ra
          </h2>
          <p className="mb-4 text-gray-600">{error}</p>
          <button
            onClick={retry}
            className="px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // Product Card Component
  const ProductCard = ({ product }: { product: Product }) => (
    <Link to={`/products/detail/${product._id}`}>
      <div className="overflow-hidden transition-all duration-300 bg-white shadow-sm group hover:shadow-md">
        <div className="relative overflow-hidden aspect-[3/4]">
          <img
            src={product.thumbnail}
            alt={product.title}
            className="object-cover w-full h-full transition-transform duration-300 "
            loading="lazy"
          />
          {hasDiscount(product) && (
            <span className="absolute px-1.5 sm:px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-md top-1 sm:top-2 left-1 sm:left-2">
              -{product.discountPercentage}%
            </span>
          )}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFavorite(product._id);
            }}
            className="absolute p-1.5 sm:p-2 transition-all duration-200 bg-white rounded-full shadow-md opacity-0 top-1 sm:top-2 right-1 sm:right-2 group-hover:opacity-100 hover:bg-gray-50"
            aria-label={favorites.includes(product._id) ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
          >
            {favorites.includes(product._id) ? (
              <MdFavorite className="w-3 h-3 text-red-500 sm:w-4 sm:h-4" />
            ) : (
              <MdFavoriteBorder className="w-3 h-3 text-gray-600 sm:w-4 sm:h-4" />
            )}
          </button>
        </div>
        <div className="p-2 sm:p-4">
          <h3 className="mb-2 text-sm font-semibold text-gray-800 sm:text-base line-clamp-2">
            {product.title}
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              {product.priceNew && product.priceNew < product.price ? (
                <>
                  <span className="text-base font-bold text-red-600 sm:text-lg">
                    {product.priceNew.toLocaleString("vi-VN")}đ
                  </span>
                  <span className="text-xs text-gray-500 line-through sm:text-sm">
                    {product.price.toLocaleString("vi-VN")}đ
                  </span>
                  <span className="flex items-center gap-1 text-xs font-medium text-green-700">
                    <MdAttachMoney className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    Tiết kiệm{" "}
                    {calculateSavings(
                      product.price,
                      product.discountPercentage!
                    ).toLocaleString("vi-VN")}
                    ₫
                  </span>
                </>
              ) : (
                <span className="text-base font-bold text-gray-900 sm:text-lg">
                  {product.price.toLocaleString("vi-VN")}đ
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );

  // Article Card Component
  const ArticleCard = ({ article }: { article: Article }) => (
    <Link to={`/articles/${article._id}`}>
      <div className="overflow-hidden transition-shadow duration-300 bg-white rounded-lg shadow-md ">
        <div className="bg-gray-200 aspect-w-16 aspect-h-9">
          <img
            src={article.thumbnail || "/placeholder-article.jpg"}
            alt={article.title}
            className="object-cover w-full h-32 sm:h-40"
            loading="lazy"
          />
        </div>
        <div className="p-3 sm:p-4">
          <h3 className="mb-2 text-sm font-semibold text-gray-800 sm:text-base line-clamp-2">
            {article.title}
          </h3>
          {article.description && (
            <p className="mb-3 text-xs text-gray-600 sm:text-sm line-clamp-3">
              {article.description}
            </p>
          )}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{new Date(article.createdAt).toLocaleDateString("vi-VN")}</span>
            {article.featured === "1" && (
              <span className="px-2 py-1 text-blue-800 bg-blue-100 rounded-full">
                Nổi bật
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );

  // Brand Card Component - SỬA ĐỔI CHÍNH
  const BrandCard = ({ brandData }: { brandData: BrandCount }) => (
    <Link to={`/brand/${brandData._id}`}>
      <div className="p-4 text-center transition-all duration-200 bg-white border border-gray-200 rounded-lg hover:shadow-md hover:border-blue-300">
        <h4 className="text-sm font-semibold text-gray-800 sm:text-base">
          {brandData._id}
        </h4>
        <p className="text-xs text-gray-500 sm:text-sm">
          {brandData.count} sản phẩm
        </p>
      </div>
    </Link>
  );

  return (
    <>
      <Slide />
      <div className="min-h-screen bg-gray-50">
        <main className="px-2 py-6 mx-auto sm:px-4 sm:py-8 max-w-7xl">
          {/* Featured Products Section */}
          {productsFeatured.length > 0 && (
            <section className="mb-8 sm:mb-12">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                  SẢN PHẨM NỔI BẬT
                </h2>
                {/* <Link
                  to="/products?featured=1"
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Xem tất cả
                </Link> */}
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {productsFeatured.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            </section>
          )}

          {/* New Products Section */}
          {productsNew.length > 0 && (
            <section className="mb-8 sm:mb-12">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                  SẢN PHẨM MỚI NHẤT
                </h2>
                {/* <Link
                  to="/products?sort=newest"
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Xem tất cả
                </Link> */}
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {productsNew.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            </section>
          )}

          {/* Categories with Products Section */}
          {categories.length > 0 && (
            <section className="mb-8 sm:mb-12">
              <h2 className="mb-6 text-xl font-bold text-gray-900 sm:mb-8 sm:text-2xl">
                SẢN PHẨM THEO DANH MỤC
              </h2>
              {categories.map((category) => (
                <div key={category._id} className="mb-8 sm:mb-10">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <div className="flex items-center">
                      <h3 className="text-lg font-semibold text-gray-800 sm:text-xl">
                        {category.title}
                      </h3>
                      {category.description && (
                        <span className="hidden ml-3 text-xs text-gray-500 sm:text-sm sm:inline">
                          {category.description}
                        </span>
                      )}
                    </div>
                    <Link
                      to={`/category/${category._id}`}
                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      Xem tất cả
                    </Link>
                  </div>
                  {category.products && category.products.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                      {category.products.slice(0, 8).map((product) => (
                        <ProductCard key={product._id} product={product} />
                      ))}
                    </div>
                  ) : (
                    <div className="py-6 text-sm text-center text-gray-500 sm:py-8 sm:text-base">
                      Chưa có sản phẩm trong danh mục này
                    </div>
                  )}
                </div>
              ))}
            </section>
          )}
        <Link to="/category/68c5caed30ea155ad538ee91">
          <section className="mb-8 sm:mb-12">
            <img src={Postert} alt="áo trẻ em" />
          </section>
        </Link>

        <Link to="/category/68c5cd2030ea155ad538f02f">
          <section className="mb-8 sm:mb-12">
            <img src={Postert_giay} alt="giày dep" />
          </section>
        </Link>

          {/* Brands Section - SỬA ĐỔI CHÍNH */}
          {brandCounts.length > 0 && (
            <section className="mb-8 sm:mb-12">
              <div className="flex items-center justify-between mb-6 sm:mb-8">
                <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                  THƯƠNG HIỆU
                </h2>
                <Link
                  to="/brands"
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Xem tất cả
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {brandCounts.slice(0, 12).map((brandData) => (
                  <BrandCard key={brandData._id} brandData={brandData} />
                ))}
              </div>
            </section>
          )}

          {/* Featured Articles Section */}
          {articlesFeatured.length > 0 && (
            <section className="mb-8 sm:mb-12">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                  BÀI VIẾT NỔI BẬT
                </h2>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-500 sm:text-sm">
                    {articlesFeatured.length} bài viết
                  </span>
                  <Link
                    to="/articles"
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Xem tất cả
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {articlesFeatured.map((article) => (
                  <ArticleCard key={article._id} article={article} />
                ))}
              </div>
            </section>
          )}

          {/* Empty State */}
          {productsFeatured.length === 0 &&
            productsNew.length === 0 &&
            categories.length === 0 &&
            articlesFeatured.length === 0 && (
              <div className="py-12 text-center sm:py-16">
                <div className="mb-4 text-4xl text-gray-400 sm:text-6xl">📦</div>
                <h3 className="mb-2 text-lg font-semibold text-gray-700 sm:text-xl">
                  Chưa có dữ liệu
                </h3>
                <p className="mb-4 text-sm text-gray-500 sm:mb-6 sm:text-base">
                  Hiện tại chưa có sản phẩm hoặc bài viết nào được hiển thị
                </p>
                <button
                  onClick={retry}
                  className="px-4 py-2 text-sm text-white transition-colors bg-blue-600 rounded-lg sm:px-6 sm:py-3 sm:text-base hover:bg-blue-700"
                >
                  Tải lại dữ liệu
                </button>
              </div>
            )}
        </main>
      </div>
    </>
  );
};

export default HomePage;