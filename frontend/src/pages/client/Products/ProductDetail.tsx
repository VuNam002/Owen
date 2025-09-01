import { useEffect, useState } from "react";
import {toast} from "react-toastify";
import {
  Heart,
  ShoppingCart,
  Minus,
  Plus,
  Share2,
  Truck,
  RotateCcw,
  Shield,
} from "lucide-react";
import { useParams } from "react-router-dom";

interface Product {
  _id: string;
  title: string;
  price: number;
  thumbnail: string;
  oldPrice?: number;
  discountPercentage?: number;
  status: string;
  description: string;
  size: string;
  color: string;
  stock: number;
  product_category_id: {
    _id: string;
    title: string;
  };
}

const COLOR_OPTIONS = [
  { value: "red", label: "Đỏ", hex: "#FF0000" },
  { value: "blue", label: "Xanh dương", hex: "#0000FF" },
  { value: "green", label: "Xanh lá", hex: "#008000" },
  { value: "yellow", label: "Vàng", hex: "#FFFF00" },
  { value: "purple", label: "Tím", hex: "#800080" },
  { value: "orange", label: "Cam", hex: "#FFA500" },
  { value: "pink", label: "Hồng", hex: "#FFC0CB" },
  { value: "brown", label: "Nâu", hex: "#A52A2A" },
  { value: "black", label: "Đen", hex: "#000000" },
  { value: "white", label: "Trắng", hex: "#FFFFFF" },
];

const mockImages = [
  "https://via.placeholder.com/400x400/4F46E5/ffffff?text=Product+1",
  "https://via.placeholder.com/400x400/7C3AED/ffffff?text=Product+2",
  "https://via.placeholder.com/400x400/DC2626/ffffff?text=Product+3",
  "https://via.placeholder.com/400x400/059669/ffffff?text=Product+4",
];

function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [isWishlisted, setIsWishlisted] = useState<boolean>(false);

  // Helper functions
  const parseJsonArray = (jsonStr: string) => {
    try {
      return JSON.parse(jsonStr);
    } catch {
      return [];
    }
  };

  const availableColors = product?.color ? parseJsonArray(product.color) : [];
  const availableSizes = product?.size ? parseJsonArray(product.size) : [];

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  const getColorInfo = (colorValue: string) => {
    const predefinedColor = COLOR_OPTIONS.find((c) => c.value === colorValue);
    return {
      hex: predefinedColor?.hex || colorValue,
      label: predefinedColor?.label || colorValue,
    };
  };

  const hasDiscount = () => product && (product.oldPrice || product.discountPercentage);
  
  //Giá sau khi giảm
  const calculateDiscountedPrice = () => {
    if (!product) return 0;
    if (product.oldPrice && product.discountPercentage) {
      return product.oldPrice * (1 - product.discountPercentage / 100);
    }
    if (product.discountPercentage) {
      return product.price * (1 - product.discountPercentage / 100);
    }
    return product.oldPrice ? product.price : product.price;
  };

  const calculateSavings = () => {
    if (!product || !hasDiscount()) return 0;
    const originalPrice = product.oldPrice || product.price;
    return originalPrice - calculateDiscountedPrice();
  };

  const getDiscountPercent = () => {
    if (!product) return 0;
    return product.discountPercentage || 
           (product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0);
  };

  // Event handlers
  const handleQuantityChange = (type: "increase" | "decrease") => {
    if (type === "increase" && quantity < (product?.stock || 0)) {
      setQuantity(prev => prev + 1);
    } else if (type === "decrease" && quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    if (availableSizes.length > 0 && !selectedSize) {
      toast.error("Vui lòng chọn size!");
      return;
    }
    if (availableColors.length > 0 && !selectedColor) {
      toast.error("Vui lòng chọn màu sắc!");
      return;
    }

    const cartItem = {
      productId: product._id,
      title: product.title,
      price: hasDiscount() ? calculateDiscountedPrice() : product.price,
      originalPrice: product.oldPrice || product.price,
      size: selectedSize,
      color: selectedColor,
      quantity: quantity,
      image: selectedImage,
    };

    console.log("Thêm vào giỏ hàng:", cartItem);
    alert(`Đã thêm ${quantity} sản phẩm "${product.title}" vào giỏ hàng!`);
  };

  // Effects
  useEffect(() => {
    if (!id) {
      setError("Không tìm thấy ID sản phẩm");
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`http://localhost:3000/api/v1/products/detail/${id}`);
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const result = await response.json();
        if (!result.data) throw new Error("Không có dữ liệu sản phẩm");
        
        setProduct(result.data);
        setSelectedImage(result.data.thumbnail || mockImages[0]);
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm:", error);
        setError(error instanceof Error ? error.message : "Có lỗi xảy ra");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product) {
      if (availableColors.length > 0 && !selectedColor) {
        setSelectedColor(availableColors[0]);
      }
      if (availableSizes.length > 0 && !selectedSize) {
        setSelectedSize(availableSizes[0]);
      }
    }
  }, [product, availableColors, availableSizes, selectedColor, selectedSize]);

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
          <h2 className="text-2xl font-bold text-gray-900">Không tìm thấy sản phẩm</h2>
          <p className="text-gray-600">{error || "Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa."}</p>
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
          <a href="/" className="transition-colors hover:text-indigo-600">Trang chủ</a>
          <span>/</span>
          <a href="/products" className="transition-colors hover:text-indigo-600">Sản phẩm</a>
          <span>/</span>
          <span className="text-gray-900">{product.product_category_id.title}</span>
          <span>/</span>
          <span className="font-medium text-gray-900">{product.title}</span>
        </nav>

        <div className="overflow-hidden bg-white rounded-xl">
          <div className="lg:grid lg:grid-cols-2">
            {/* Image Gallery */}
            <div className="p-8">
              {/* Main Image */}
              <div className="mb-6 overflow-hidden bg-gray-100 aspect-square rounded-xl">
                <img
                  src={selectedImage}
                  alt={product.title}
                  className="object-cover w-full h-full transition-transform"
                />
              </div>

              {/* Image Thumbnails */}
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
                    <img src={image} alt={`Product ${index + 1}`} className="object-cover w-full h-full" />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="p-8 space-y-6">
              {/* Header */}
              <div>
                <p className="mb-2 text-sm font-medium text-indigo-600">
                  {product.product_category_id.title}
                </p>
                <h1 className="mb-4 text-3xl font-bold text-gray-900">{product.title}</h1>
                
                {/* Price Section */}
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
                        Tiết kiệm: <span className="font-bold">{formatPrice(calculateSavings())}</span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-3xl font-bold text-gray-900">
                    {formatPrice(product.price)}
                  </div>
                )}
              </div>

              {/* Options Section */}
              <div className="space-y-6">
                {/* Color Selection */}
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
                                ? "border-indigo-500 bg-indigo-50 text-indigo-700"
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
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
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
                              ? "border-indigo-500 bg-indigo-50 text-indigo-700"
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
                  <span className="text-sm font-medium text-gray-900">Số lượng</span>
                  <span className="text-sm text-gray-500">Còn {product.stock} sản phẩm</span>
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
                    onClick={handleAddToCart}
                    className="flex items-center justify-center col-span-2 px-6 py-3 font-semibold text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                    disabled={product.stock <= 0}
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    {product.stock <= 0 ? "Hết hàng" : "Thêm vào giỏ"}
                  </button>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setIsWishlisted(!isWishlisted)}
                      className={`flex-1 flex items-center justify-center p-3 border-2 rounded-lg transition-colors ${
                        isWishlisted
                          ? "border-red-300 text-red-600 bg-red-50"
                          : "border-gray-300 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`} />
                    </button>
                    <button className="flex items-center justify-center flex-1 p-3 text-gray-600 transition-colors border-2 border-gray-300 rounded-lg hover:bg-gray-50">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 gap-4 p-6 rounded-lg bg-gray-50">
                {[
                  { icon: Truck, title: "Miễn phí vận chuyển", desc: "Đơn hàng từ 500k", color: "text-green-600" },
                  { icon: RotateCcw, title: "Đổi trả 30 ngày", desc: "Miễn phí đổi trả", color: "text-blue-600" },
                  { icon: Shield, title: "Bảo hành chính hãng", desc: "Cam kết chất lượng", color: "text-purple-600" },
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <feature.icon className={`w-5 h-5 ${feature.color}`} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{feature.title}</p>
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
                <h4 className="mb-2 text-sm font-medium text-gray-900">Lựa chọn của bạn:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedColor && (
                    <span className="inline-flex items-center px-3 py-1 text-sm bg-white border border-gray-200 rounded-full">
                      <div
                        className="w-3 h-3 mr-2 border border-gray-300 rounded-full"
                        style={{ backgroundColor: getColorInfo(selectedColor).hex }}
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
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Thông số kỹ thuật</h3>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="p-4 rounded-lg bg-gray-50">
                  <dt className="mb-1 text-sm font-medium text-gray-900">Tình trạng</dt>
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
                    <dt className="mb-2 text-sm font-medium text-gray-900">Màu sắc có sẵn</dt>
                    <dd className="flex flex-wrap gap-2">
                      {availableColors.map((color: string) => {
                        const { hex, label } = getColorInfo(color);
                        return (
                          <div key={color} className="flex items-center space-x-1">
                            <div
                              className="w-4 h-4 border border-gray-300 rounded-full"
                              style={{ backgroundColor: hex }}
                            />
                            <span className="text-xs text-gray-600">{label}</span>
                          </div>
                        );
                      })}
                    </dd>
                  </div>
                )}

                {availableSizes.length > 0 && (
                  <div className="p-4 rounded-lg bg-gray-50">
                    <dt className="mb-1 text-sm font-medium text-gray-900">Kích thước có sẵn</dt>
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
                  <dt className="mb-1 text-sm font-medium text-gray-900">Số lượng trong kho</dt>
                  <dd className="text-sm text-gray-600">{product.stock} sản phẩm</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Product Description */}
          <div className="px-8 pb-8">
            <div className="pt-8 border-t border-gray-200">
              <h3 className="mb-4 text-xl font-semibold text-gray-900">Chi tiết sản phẩm</h3>
              <div
                className="prose-sm prose text-gray-600 max-w-none"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;