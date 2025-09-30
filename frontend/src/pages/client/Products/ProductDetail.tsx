import {
  Heart,
  ShoppingCart,
  Minus,
  Plus,
  Truck,
  RotateCcw,
  Shield,
  MessageCircle,
  Send,
  User,
} from "lucide-react";
import { useProductDetail } from "../../../hooks/useDetail";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

function ProductDetail() {
  const {
    product,
    loading,
    error,
    selectedSize,
    selectedColor,
    quantity,
    selectedImage,
    isWishlisted,
    comments,
    commentForm,
    isSubmittingComment,
    showCommentForm,
    mockImages,
    availableColors,
    availableSizes,
    formatPrice,
    formatDate,
    getColorInfo,
    hasDiscount,
    calculateDiscountedPrice,
    calculateSavings,
    getDiscountPercent,
    handleQuantityChange,
    handleAddToCart,
    handleWishlistToggle,
    handleCommentSubmit,
    handleCommentFormChange,
    toggleCommentForm,
    setSelectedSize,
    setSelectedColor,
    setSelectedImage,
  } = useProductDetail();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-b-2 border-indigo-600 rounded-full animate-spin"></div>
          <p className="text-gray-600">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="space-y-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Không tìm thấy sản phẩm
          </h2>
          <p className="text-gray-600">
            {error ||
              "Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa."}
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center mb-8 space-x-2 text-sm text-gray-500">
          <a href="/" className="transition-colors hover:text-indigo-600">
            Trang chủ
          </a>
          <span>/</span>
          <span className="text-gray-900">
            {product.product_category_id.title}
          </span>
          <span>/</span>
          <span className="font-medium text-gray-900">{product.title}</span>
        </nav>

        <div className="overflow-hidden bg-white rounded-xl">
          <div className="lg:grid lg:grid-cols-2">
            {/* Product Images */}
            <div className="p-8">
              <div className="mb-6 overflow-hidden bg-gray-100 aspect-square rounded-xl">
                <img
                  src={selectedImage}
                  alt={product.title}
                  className="object-cover w-full h-full transition-transform"
                />
              </div>

              <div className="grid grid-cols-4 gap-4">
                {mockImages.map((image, index) => (
                  <button
                    key={index}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === image
                        ? "border-indigo-500 shadow-md"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedImage(image)}
                  >
                    <img
                      src={image}
                      alt={`Product ${index + 1}`}
                      className="object-cover w-full h-full"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="p-8 space-y-6">
              <div>
                <p className="mb-2 text-sm font-medium text-[#323232]">
                  {product.product_category_id.title}
                </p>
                <h1 className="mb-4 text-3xl font-bold text-gray-900">
                  {product.title}
                </h1>

                {/* Price */}
                {hasDiscount() ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl font-bold text-red-600">
                        {formatPrice(calculateDiscountedPrice())}
                      </span>
                      <span className="px-3 py-1 text-sm font-semibold text-red-800 bg-red-100 rounded-full">
                        -{getDiscountPercent()}%
                      </span>
                    </div>
                    <div className="text-lg text-gray-500 line-through">
                      {formatPrice(product.oldPrice || product.price)}
                    </div>
                    <div className="p-3 border border-green-200 rounded-lg bg-green-50">
                      <p className="text-sm font-medium text-green-800">
                        Tiết kiệm:{" "}
                        <span className="font-bold">
                          {formatPrice(calculateSavings())}
                        </span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-3xl font-bold text-gray-900">
                    {formatPrice(product.price)}
                  </div>
                )}
              </div>

              {/* Color Selection */}
              <div className="space-y-6">
                {availableColors.length > 0 && (
                  <div>
                    <h3 className="mb-3 text-sm font-medium text-gray-900">
                      Màu sắc <span className="text-red-500">*</span>
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {availableColors.map((color: string) => {
                        const { hex, label } = getColorInfo(color);
                        const isSelected = selectedColor === color;

                        return (
                          <button
                            key={color}
                            className={`relative flex items-center space-x-2 px-4 py-2 border-2 rounded-lg transition-all ${
                              isSelected
                                ? "border-[#323232] bg-indigo-50 text-[#323232]"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                            onClick={() => setSelectedColor(color)}
                          >
                            <div
                              className="w-5 h-5 border-2 border-white rounded-full shadow-sm"
                              style={{ backgroundColor: hex }}
                            />
                            <span className="text-sm font-medium">{label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Size Selection */}
                {availableSizes.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-gray-900">
                        Kích cỡ <span className="text-red-500">*</span>
                      </h3>
                      <a
                        href="#"
                        className="text-sm font-medium text-[#323232] hover:text-[#323232]"
                      >
                        Hướng dẫn chọn size
                      </a>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {availableSizes.map((size: string) => (
                        <button
                          key={size}
                          className={`px-4 py-2 border-2 rounded-lg text-sm font-medium transition-all ${
                            selectedSize === size
                              ? "border-[#323232] bg-indigo-50 text-[#323232]"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => setSelectedSize(size)}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Quantity & Actions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">
                    Số lượng
                  </span>
                  <span className="text-sm text-gray-500">
                    Còn {product.stock} sản phẩm
                  </span>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => handleQuantityChange("decrease")}
                      className="p-3 transition-colors hover:bg-gray-100 disabled:opacity-50"
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-3 font-semibold">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange("increase")}
                      className="p-3 transition-colors hover:bg-gray-100 disabled:opacity-50"
                      disabled={quantity >= product.stock}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <button
                    onClick={async () => {
                      const success = await handleAddToCart();
                      if (success) {
                        navigate("/cart"); // chuyển sang giỏ hàng sau khi thêm
                      }
                    }}
                    className="flex items-center justify-center col-span-2 px-6 py-3 font-semibold text-white transition-colors bg-[#323232] hover:bg-[#323236] disabled:opacity-50"
                    disabled={product.stock <= 0}
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    {product.stock <= 0 ? "Hết hàng" : "Thêm vào giỏ"}
                  </button>

                  <div className="flex space-x-2">
                    <button
                      onClick={handleWishlistToggle}
                      className={`flex-1 flex items-center justify-center p-3 border-2 rounded-lg transition-colors ${
                        isWishlisted
                          ? "border-red-300 text-red-600 bg-red-50"
                          : "border-gray-300 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          isWishlisted ? "fill-current" : ""
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 gap-4 p-6 rounded-lg bg-gray-50">
                {[
                  {
                    icon: Truck,
                    title: "Miễn phí vận chuyển",
                    desc: "Đơn hàng từ 500k",
                    color: "text-green-600",
                  },
                  {
                    icon: RotateCcw,
                    title: "Đổi trả 30 ngày",
                    desc: "Miễn phí đổi trả",
                    color: "text-blue-600",
                  },
                  {
                    icon: Shield,
                    title: "Bảo hành chính hãng",
                    desc: "Cam kết chất lượng",
                    color: "text-purple-600",
                  },
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <feature.icon className={`w-5 h-5 ${feature.color}`} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {feature.title}
                      </p>
                      <p className="text-xs text-gray-500">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Selected Options Display */}
          {(selectedColor || selectedSize) && (
            <div className="mx-8 mb-6">
              <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                <h4 className="mb-2 text-sm font-medium text-gray-900">
                  Lựa chọn của bạn:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedColor && (
                    <span className="inline-flex items-center px-3 py-1 text-sm bg-white border border-gray-200 rounded-full">
                      <div
                        className="w-3 h-3 mr-2 border border-gray-300 rounded-full"
                        style={{
                          backgroundColor: getColorInfo(selectedColor).hex,
                        }}
                      />
                      Màu: {getColorInfo(selectedColor).label}
                    </span>
                  )}
                  {selectedSize && (
                    <span className="inline-flex items-center px-3 py-1 text-sm bg-white border border-gray-200 rounded-full">
                      Size: {selectedSize}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Specifications */}
          <div className="px-8 pb-6">
            <div className="pt-6 border-t border-gray-200">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Thông số sản phẩm
              </h3>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="p-4 rounded-lg bg-gray-50">
                  <dt className="mb-1 text-sm font-medium text-gray-900">
                    Tình trạng
                  </dt>
                  <dd>
                    <span
                      className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        product.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.status === "active" ? "Còn hàng" : "Hết hàng"}
                    </span>
                  </dd>
                </div>

                {availableColors.length > 0 && (
                  <div className="p-4 rounded-lg bg-gray-50">
                    <dt className="mb-2 text-sm font-medium text-gray-900">
                      Màu sắc có sẵn
                    </dt>
                    <dd className="flex flex-wrap gap-2">
                      {availableColors.map((color: string) => {
                        const { hex, label } = getColorInfo(color);
                        return (
                          <div
                            key={color}
                            className="flex items-center space-x-1"
                          >
                            <div
                              className="w-4 h-4 border border-gray-300 rounded-full"
                              style={{ backgroundColor: hex }}
                            />
                            <span className="text-xs text-gray-600">
                              {label}
                            </span>
                          </div>
                        );
                      })}
                    </dd>
                  </div>
                )}

                {availableSizes.length > 0 && (
                  <div className="p-4 rounded-lg bg-gray-50">
                    <dt className="mb-1 text-sm font-medium text-gray-900">
                      Kích thước có sẵn
                    </dt>
                    <dd className="flex flex-wrap gap-1">
                      {availableSizes.map((size: string, index: number) => (
                        <span key={size} className="text-sm text-gray-600">
                          {size}
                          {index < availableSizes.length - 1 && ", "}
                        </span>
                      ))}
                    </dd>
                  </div>
                )}

                <div className="p-4 rounded-lg bg-gray-50">
                  <dt className="mb-1 text-sm font-medium text-gray-900">
                    Số lượng trong kho
                  </dt>
                  <dd className="text-sm text-gray-600">
                    {product.stock} sản phẩm
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Product Description */}
          <div className="px-8 pb-8">
            <div className="pt-8 border-t border-gray-200">
              <h3 className="mb-4 text-xl font-semibold text-gray-900">
                Chi tiết sản phẩm
              </h3>
              <div
                className="prose-sm prose text-gray-600 max-w-none"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>
          </div>

          {/* Comments Section */}
          <div className="px-8 pb-8">
            <div className="pt-8 border-t border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="flex items-center text-xl font-semibold text-gray-900">
                  <MessageCircle className="w-6 h-6 mr-2 text-indigo-600" />
                  Đánh giá và bình luận ({comments.length})
                </h3>
                <button
                  onClick={toggleCommentForm}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white transition-colors bg-[#323232] rounded-lg"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Viết bình luận
                </button>
              </div>

              {/* Comment Form */}
              {/* Comment Form */}
              {showCommentForm && (
                <div className="p-6 mb-8 border border-gray-200 rounded-lg bg-gray-50">
                  <h4 className="mb-4 text-lg font-semibold text-gray-900">
                    Viết bình luận của bạn
                  </h4>
                  {/* THÊM FORM TAG VÀ onSubmit Ở ĐÂY */}
                  <form onSubmit={handleCommentSubmit} className="space-y-4">
                    <div>
                      <label
                        htmlFor="content"
                        className="block mb-2 text-sm font-medium text-gray-700"
                      >
                        Nội dung bình luận{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="content"
                        rows={4}
                        value={commentForm.content}
                        onChange={(e) =>
                          handleCommentFormChange("content", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
                        required
                      />
                    </div>
                    <div className="flex items-center space-x-4">
                      <button
                        type="submit" // ĐẢM BẢO TYPE LÀ "submit"
                        disabled={isSubmittingComment}
                        className="flex items-center px-6 py-2 text-sm font-medium text-white transition-colors bg-[#323232] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmittingComment ? (
                          <>
                            <div className="w-4 h-4 mr-2 border-2 border-white rounded-full border-t-transparent animate-spin" />
                            Đang gửi...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Gửi bình luận
                          </>
                        )}
                      </button>
                      <button
                        type="button" // Button hủy phải là type="button" để không submit
                        onClick={toggleCommentForm}
                        className="px-6 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Hủy
                      </button>
                    </div>
                  </form>{" "}
                  {/* ĐÓNG FORM TAG */}
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-6">
                {comments.length === 0 ? (
                  <div className="py-12 text-center">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h4 className="mb-2 text-lg font-medium text-gray-900">
                      Chưa có bình luận nào
                    </h4>
                    <p className="text-gray-500">
                      Hãy là người đầu tiên chia sẻ cảm nhận về sản phẩm này!
                    </p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div
                      key={comment._id}
                      className="p-6 bg-white border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-full">
                            <User className="w-5 h-5 text-indigo-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-semibold text-gray-900">
                              {comment.fullName}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {formatDate(comment.createdAt)}
                            </p>
                          </div>
                          <p className="text-sm leading-relaxed text-gray-700">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ProductDetail;
