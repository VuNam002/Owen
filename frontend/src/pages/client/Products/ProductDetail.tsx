import { useEffect, useState } from "react";
import { Star, Heart, ShoppingCart, Minus, Plus, Share2, Truck, RotateCcw, Shield } from "lucide-react";
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
    size: string[];
    color: string[];
    quantity: number;
    
    product_category_id: {
        _id: string;
        title: string;
    };
    
}

// Mock images cho demo
const mockImages = [
    "https://via.placeholder.com/400x400/4F46E5/ffffff?text=Product+1",
    "https://via.placeholder.com/400x400/7C3AED/ffffff?text=Product+2", 
    "https://via.placeholder.com/400x400/DC2626/ffffff?text=Product+3",
    "https://via.placeholder.com/400x400/059669/ffffff?text=Product+4"
];

function ProductDetail() {
    // Lấy id từ URL params
    const { id } = useParams<{ id: string }>();
    
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedSize, setSelectedSize] = useState<string>("");
    const [selectedColor, setSelectedColor] = useState<string>("");
    const [quantity, setQuantity] = useState<number>(1);
    const [selectedImage, setSelectedImage] = useState<string>("");
    const [isWishlisted, setIsWishlisted] = useState<boolean>(false);

    useEffect(() => {
        // Kiểm tra id có tồn tại không
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
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const result = await response.json();
                
                if (!result.data) {
                    throw new Error('Không có dữ liệu sản phẩm');
                }
                
                setProduct(result.data);
                setSelectedImage(result.data.thumbnail || mockImages[0]);
                
                // Set default size và color nếu có
                if (result.data.size && result.data.size.length > 0) {
                    setSelectedSize(result.data.size[0]);
                }
                if (result.data.color && result.data.color.length > 0) {
                    setSelectedColor(result.data.color[0]);
                }
                
            } catch (error) {
                console.error('Lỗi khi tải sản phẩm:', error);
                setError(error instanceof Error ? error.message : 'Có lỗi xảy ra');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]); // Dependency array chỉ có id

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const handleQuantityChange = (type: 'increase' | 'decrease') => {
        if (type === 'increase' && quantity < (product?.stock || 0)) {
            setQuantity(prev => prev + 1);
        } else if (type === 'decrease' && quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    const handleAddToCart = () => {
        if (!product) return;
        
        if (!selectedSize) {
            alert("Vui lòng chọn size!");
            return;
        }
        if (!selectedColor) {
            alert("Vui lòng chọn màu sắc!");
            return;
        }
        
        const cartItem = {
            productId: product._id,
            title: product.title,
            price: product.price,
            size: selectedSize,
            color: selectedColor,
            quantity: quantity,
            image: selectedImage
        };
        
        console.log('Thêm vào giỏ hàng:', cartItem);
        alert(`Đã thêm ${quantity} sản phẩm "${product.title}" vào giỏ hàng!`);
    };

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-b-2 border-gray-900 rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-600">Đang tải sản phẩm...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !product) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="mb-4 text-2xl font-bold text-gray-900">Không tìm thấy sản phẩm</h2>
                    <p className="mb-4 text-gray-600">
                        {error || "Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa."}
                    </p>
                    <button 
                        onClick={() => window.history.back()}
                        className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                    >
                        Quay lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <nav className="flex items-center mb-8 space-x-2 text-sm text-gray-500">
                <a href="/" className="hover:text-gray-700">Trang chủ</a>
                <span>/</span>
                <a href="/products" className="hover:text-gray-700">Sản phẩm</a>
                <span>/</span>
                <span className="text-gray-900">{product.product_category_id.title}</span>
                <span>/</span>
                <span className="text-gray-900">{product.title}</span>
            </nav>

            <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
                {/* Image Gallery */}
                <div className="flex flex-col-reverse">
                    {/* Image Thumbnails */}
                    <div className="w-full max-w-2xl mx-auto mt-6 sm:block lg:max-w-none">
                        <div className="grid grid-cols-4 gap-4">
                            {mockImages.map((image, index) => (
                                <button
                                    key={index}
                                    className={`relative h-20 cursor-pointer rounded-md overflow-hidden border-2 ${
                                        selectedImage === image ? 'border-indigo-500' : 'border-gray-200'
                                    }`}
                                    onClick={() => setSelectedImage(image)}
                                >
                                    <img
                                        src={image}
                                        alt={`Product ${index + 1}`}
                                        className="object-cover object-center w-full h-full"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Main Image */}
                    <div className="w-full aspect-w-1 aspect-h-1">
                        <img
                            src={selectedImage}
                            alt={product.title}
                            className="object-cover object-center w-full rounded-lg h-96 lg:h-full lg:w-full"
                        />
                    </div>
                </div>

                {/* Product Info */}
                <div className="px-4 mt-10 sm:px-0 sm:mt-16 lg:mt-0">
                    {/* Product Category */}
                    <div className="mb-2 text-sm font-medium text-indigo-600">
                        {product.product_category_id.title}
                    </div>

                    {/* Product Title */}
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                        {product.title}
                    </h1>

                    {/* Rating */}
                    <div className="flex items-center mt-3">
                        <div className="flex items-center">
                            {[0, 1, 2, 3, 4].map((rating) => (
                                <Star
                                    key={rating}
                                    className="flex-shrink-0 w-5 h-5 text-yellow-400 fill-current"
                                />
                            ))}
                        </div>
                        <p className="ml-3 text-sm text-gray-500">
                            4.8 (124 đánh giá)
                        </p>
                    </div>

                    {/* Price */}
                    <div className="mt-4">
                        <div className="flex items-center space-x-2">
                            <p className="text-3xl font-bold text-gray-900">
                                {formatPrice(product.price)}
                            </p>
                            {product.oldPrice && (
                                <>
                                    <p className="text-lg text-gray-500 line-through">
                                        {formatPrice(product.oldPrice)}
                                    </p>
                                    <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                                        -{product.discountPercentage}%
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="mt-6">
                        <h3 className="text-sm font-medium text-gray-900">Mô tả sản phẩm</h3>
                        <div className="mt-4 prose-sm prose text-gray-500">
                            <p>{product.description}</p>
                        </div>
                    </div>

                    {/* Size Selection */}
                    {product.size && product.size.length > 0 && (
                        <div className="mt-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium text-gray-900">Kích cỡ</h3>
                                <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                                    Hướng dẫn chọn size
                                </a>
                            </div>
                            <div className="grid grid-cols-4 gap-3 mt-4 sm:grid-cols-6">
                                {product.size.map((size) => (
                                    <button
                                        key={size}
                                        className={`border rounded-md py-3 px-3 text-sm font-medium uppercase hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                            selectedSize === size
                                                ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                                                : 'border-gray-200 text-gray-900'
                                        }`}
                                        onClick={() => setSelectedSize(size)}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Color Selection */}
                    {product.color && product.color.length > 0 && (
                        <div className="mt-6">
                            <h3 className="text-sm font-medium text-gray-900">Màu sắc</h3>
                            <div className="flex items-center mt-4 space-x-3">
                                {product.color.map((color) => (
                                    <button
                                        key={color}
                                        className={`border-2 rounded-md px-4 py-2 text-sm font-medium ${
                                            selectedColor === color
                                                ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                                                : 'border-gray-200 text-gray-900 hover:bg-gray-50'
                                        }`}
                                        onClick={() => setSelectedColor(color)}
                                    >
                                        {color}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quantity & Add to Cart */}
                    <div className="mt-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-gray-900">Số lượng</h3>
                            <p className="text-sm text-gray-500">Còn {product.stock} sản phẩm</p>
                        </div>
                        
                        <div className="flex items-center mb-6 space-x-4">
                            <div className="flex items-center border border-gray-300 rounded-md">
                                <button
                                    onClick={() => handleQuantityChange('decrease')}
                                    className="p-2 hover:bg-gray-100 disabled:opacity-50"
                                    disabled={quantity <= 1}
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="px-4 py-2 font-medium text-gray-900">{quantity}</span>
                                <button
                                    onClick={() => handleQuantityChange('increase')}
                                    className="p-2 hover:bg-gray-100 disabled:opacity-50"
                                    disabled={quantity >= product.quantity}
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
                            <button
                                onClick={handleAddToCart}
                                className="flex items-center justify-center flex-1 px-8 py-3 text-base font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                disabled={product.quantity <= 0}
                            >
                                <ShoppingCart className="w-5 h-5 mr-2" />
                                {product.quantity <= 0 ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
                            </button>
                            <button
                                onClick={() => setIsWishlisted(!isWishlisted)}
                                className={`bg-white border rounded-md py-3 px-8 flex items-center justify-center text-base font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                                    isWishlisted ? 'border-red-300 text-red-600' : 'border-gray-300 text-gray-900'
                                }`}
                            >
                                <Heart className={`h-5 w-5 mr-2 ${isWishlisted ? 'fill-current' : ''}`} />
                                Yêu thích
                            </button>
                            <button className="flex items-center justify-center px-8 py-3 text-base font-medium text-gray-900 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                <Share2 className="w-5 h-5 mr-2" />
                                Chia sẻ
                            </button>
                        </div>
                    </div>

                    {/* Product Features */}
                    <div className="pt-8 mt-8 border-t border-gray-200">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div className="flex items-center">
                                <Truck className="w-6 h-6 mr-3 text-green-500" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Miễn phí vận chuyển</p>
                                    <p className="text-xs text-gray-500">Đơn hàng từ 500k</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <RotateCcw className="w-6 h-6 mr-3 text-blue-500" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Đổi trả 30 ngày</p>
                                    <p className="text-xs text-gray-500">Miễn phí đổi trả</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <Shield className="w-6 h-6 mr-3 text-purple-500" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Bảo hành chính hãng</p>
                                    <p className="text-xs text-gray-500">Cam kết chất lượng</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductDetail;