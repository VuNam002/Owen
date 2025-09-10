import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle, Truck, Phone, AlertTriangle, Loader } from "lucide-react";

interface UserInfo {
    fullName: string;
    phone: string;
    address: string;
}

interface ProductInfo {
    thumbnail: string;
    title: string;
}

interface Product {
    product_id: string;
    productInfo: ProductInfo;
    price: number;
    priceNew: number;
    discountPercentage: number;
    quantity: number;
    totalPrice: number;
}

interface Order {
    _id: string;
    userInfo: UserInfo;
    products: Product[];
    totalPrice: number;
    cart_id?: string;
}

const CheckoutSuccessPage = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setLoading(true);
                setError(null);
                
                if (!orderId) {
                    setError("Không tìm thấy mã đơn hàng.");
                    setLoading(false);
                    return;
                }

                const response = await fetch(`http://localhost:3000/api/v1/checkout/success/${orderId}`, {
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                
                if (result.code === 200 && result.data) {
                    setOrder(result.data); 
                } else {
                    setError(result.message || "Không thể tải thông tin đơn hàng.");
                }
            } catch {
                console.error("Fetch order error:");
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId]);

    if (loading) {
        return (
            <div className="container flex items-center justify-center h-screen mx-auto">
                <Loader className="w-16 h-16 text-blue-500 animate-spin" />
                <p className="ml-4 text-lg">Đang tải thông tin đơn hàng...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto my-3">
                <div className="relative px-4 py-3 text-center text-red-700 bg-red-100 border border-red-400 rounded" role="alert">
                    <AlertTriangle className="inline w-5 h-5 mr-2" />
                    <strong className="font-bold">Lỗi!</strong>
                    <span className="block sm:inline"> {error}</span>
                    <div className="mt-3">
                        <Link to="/" className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600">
                            Về trang chủ
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="container mx-auto my-3">
                <div className="relative px-4 py-3 text-center text-yellow-700 bg-yellow-100 border border-yellow-400 rounded" role="alert">
                    <strong className="font-bold">Thông báo!</strong>
                    <span className="block sm:inline"> Không tìm thấy thông tin đơn hàng.</span>
                    <div className="mt-3">
                        <Link to="/" className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600">
                            Về trang chủ
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container p-4 mx-auto my-3">
            <div className="px-4 py-3 mb-4 text-green-900 bg-green-100 border-t-4 border-green-500 shadow-md" role="alert">
                <div className="flex items-center">
                    <div className="mr-3">
                        <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Đặt hàng thành công!</h2>
                        <p className="text-base">Cảm ơn bạn đã mua hàng. Chúng tôi đã nhận được đơn hàng của bạn.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    {/* Order details */}
                    <div className="mb-4 bg-white rounded-lg shadow">
                        <div className="p-4 border-b">
                            <h5 className="text-lg font-semibold">Chi tiết đơn hàng</h5>
                        </div>
                        <div className="p-4">
                            <div className="flex mb-3">
                                <strong className="w-1/3">Mã đơn hàng:</strong>
                                <span className="w-2/3 font-mono text-sm text-gray-600">{order._id}</span>
                            </div>
                            <div className="flex mb-3">
                                <strong className="w-1/3">Khách hàng:</strong>
                                <span className="w-2/3 text-gray-600">{order.userInfo?.fullName || 'N/A'}</span>
                            </div>
                            <div className="flex mb-3">
                                <strong className="w-1/3">Số điện thoại:</strong>
                                <span className="w-2/3 text-gray-600">{order.userInfo?.phone || 'N/A'}</span>
                            </div>
                            {order.userInfo?.address && (
                                <div className="flex">
                                    <strong className="w-1/3">Địa chỉ giao hàng:</strong>
                                    <span className="w-2/3 text-gray-600">{order.userInfo.address}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Products table */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="p-4 border-b">
                            <h5 className="text-lg font-semibold">Sản phẩm đã đặt</h5>
                        </div>
                        <div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <tbody>
                                        {order.products && order.products.length > 0 ? (
                                            order.products.map((item, index) => (
                                                <tr key={item.product_id || index} className="border-b">
                                                    <td className="w-20 p-3">
                                                        <img 
                                                            className="object-cover rounded" 
                                                            src={item.productInfo?.thumbnail} 
                                                            alt={item.productInfo?.title || 'Product'} 
                                                            width="60" 
                                                            height="60"
                                                            onError={(e) => {
                                                                e.currentTarget.src = '/placeholder-image.png';
                                                            }}
                                                        />
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="font-bold">{item.productInfo?.title || 'Sản phẩm không xác định'}</div>
                                                        <div className="text-sm text-gray-500">
                                                            Đơn giá: {new Intl.NumberFormat('vi-VN', { 
                                                                style: 'currency', 
                                                                currency: 'VND' 
                                                            }).format(item.priceNew || item.price || 0)}
                                                        </div>
                                                        {item.discountPercentage > 0 && (
                                                            <div className="text-xs text-red-500">
                                                                Giảm {item.discountPercentage}%
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        <span className="text-gray-500">Số lượng: {item.quantity}</span>
                                                    </td>
                                                    <td className="p-3 text-right">
                                                        <div className="font-bold">
                                                            {new Intl.NumberFormat('vi-VN', { 
                                                                style: 'currency', 
                                                                currency: 'VND' 
                                                            }).format(item.totalPrice || 0)}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="p-4 text-center text-gray-500">
                                                    Không có thông tin sản phẩm.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    {/* Order summary */}
                    <div className="mb-4 bg-white rounded-lg shadow">
                        <div className="p-4 border-b">
                            <h5 className="text-lg font-semibold">Tóm tắt đơn hàng</h5>
                        </div>
                        <div className="p-4">
                            <div className="flex items-center justify-between py-2 border-b">
                                <span>Tổng tiền hàng:</span>
                                <span className="font-bold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalPrice || 0)}</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b">
                                <span>Phí vận chuyển:</span>
                                <span className="text-green-600">Miễn phí</span>
                            </div>
                            <div className="flex items-center justify-between py-3">
                                <strong className="text-gray-800">Tổng thanh toán:</strong>
                                <strong className="text-xl text-red-600">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalPrice || 0)}</strong>
                            </div>
                        </div>
                    </div>

                    {/* Additional info */}
                    <div className="text-center bg-white rounded-lg shadow">
                        <div className="p-4">
                            <div className="mb-3">
                                <Truck className="w-8 h-8 mx-auto mb-2 text-[#323232]" />
                                <h6 className="font-semibold">Thời gian giao hàng dự kiến</h6>
                                <p className="text-sm text-gray-500">2-3 ngày làm việc</p>
                            </div>
                            {order.userInfo?.phone && (
                                <div className="mb-3">
                                    <Phone className="w-8 h-8 mx-auto mb-2 text-[#323232]" />
                                    <h6 className="font-semibold">Chúng tôi sẽ liên hệ</h6>
                                    <p className="text-sm text-gray-500">Qua số điện thoại {order.userInfo.phone} để xác nhận đơn hàng</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Action buttons */}
            <div className="mt-4">
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    <Link to="/" className="px-4 py-3 font-bold text-center text-white bg-[#323232] rounded">
                        Tiếp tục mua sắm
                    </Link>
                    <button 
                        onClick={() => window.print()} 
                        className="px-4 py-3 font-bold text-center text-[#323232] bg-white border border-[#DCB963] rounded hover:bg-blue-50"
                    >
                        In đơn hàng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CheckoutSuccessPage;