import { HooksHome } from "../../../hooks/useHome";
import { MdFavorite, MdFavoriteBorder } from "react-icons/md";
import { MdAttachMoney } from "react-icons/md";
import { Link } from "react-router-dom";

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
          <div className="mb-4 text-6xl text-red-500">⚠️</div>
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
  const ProductCard = ({ product }) => (
  <Link to={`/products/detail/${product._id}`}>
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
      <div className="p-4">
        <h3 className="mb-2 font-semibold text-gray-800 line-clamp-2">
          {product.title}
        </h3>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            {product.priceNew && product.priceNew < product.price ? (
              <>
                <span className="text-lg font-bold text-red-600">
                  {product.priceNew.toLocaleString("vi-VN")}đ
                </span>
                <span className="text-sm text-gray-500 line-through">
                  {product.price.toLocaleString("vi-VN")}đ
                </span>
                <span className="flex items-center gap-1 text-xs font-medium text-green-700">
                  <MdAttachMoney className="w-3 h-3" />
                  Tiết kiệm{" "}
                  {calculateSavings(
                    product.price,
                    product.discountPercentage!
                  ).toLocaleString("vi-VN")}
                  ₫
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-gray-900">
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
  const ArticleCard = ({ article }) => (
    <div className="overflow-hidden transition-shadow duration-300 bg-white rounded-lg shadow-md hover:shadow-lg">
      <div className="bg-gray-200 aspect-w-16 aspect-h-9">
        <img
          src={article.thumbnail || "/placeholder-article.jpg"}
          alt={article.title}
          className="object-cover w-full h-40"
        />
      </div>
      <div className="p-4">
        <h3 className="mb-2 font-semibold text-gray-800 line-clamp-2">
          {article.title}
        </h3>
        {article.description && (
          <p className="mb-3 text-sm text-gray-600 line-clamp-3">
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
  );
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="px-4 py-8 mx-auto max-w-7xl">
        {/* Featured Products Section */}
        {productsFeatured.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Sản phẩm nổi bật
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {productsFeatured.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* New Products Section */}
        {productsNew.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Sản phẩm mới nhất
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {productsNew.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </section>
        )}
        {/* Categories with Products Section */}
        {categories.length > 0 && (
          <section className="mb-12">
            <h2 className="mb-8 text-2xl font-bold text-gray-900">
              Sản phẩm theo danh mục
            </h2>
            {categories.map((category) => (
              <div key={category._id} className="mb-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <h3 className="text-xl font-semibold text-gray-800">
                      {category.title}
                    </h3>
                    {category.description && (
                      <span className="ml-3 text-sm text-gray-500">
                        {category.description}
                      </span>
                    )}
                  </div>
                </div>
                {category.products && category.products.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {category.products.map((product) => (
                      <ProductCard key={product._id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-gray-500">
                    Chưa có sản phẩm trong danh mục này
                  </div>
                )}
              </div>
            ))}
          </section>
        )}
        {/* Featured Articles Section */}
        {articlesFeatured.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Bài viết nổi bật
              </h2>
              <span className="text-sm text-gray-500">
                {articlesFeatured.length} bài viết
              </span>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
            <div className="py-16 text-center">
              <div className="mb-4 text-6xl text-gray-400">📦</div>
              <h3 className="mb-2 text-xl font-semibold text-gray-700">
                Chưa có dữ liệu
              </h3>
              <p className="mb-6 text-gray-500">
                Hiện tại chưa có sản phẩm hoặc bài viết nào được hiển thị
              </p>
              <button
                onClick={retry}
                className="px-6 py-3 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Tải lại dữ liệu
              </button>
            </div>
          )}
      </main>
    </div>
  );
};

export default HomePage;
