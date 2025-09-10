
import { Link, useLocation } from "react-router-dom";
import { CheckCircle, Truck, Phone } from "lucide-react";

interface UserInfo {
    fullName: string;
    phone: string;
}

interface ProductInfo {
    thumbnail: string;
    title: string;
}

interface Product {
    productInfo: ProductInfo;
    priceNew: number;
    quantity: number;
    totalPrice: number;
}

interface Order {
    _id: string;
    userInfo: UserInfo;
    products: Product[];
    totalPrice: number;
}

const CheckoutSuccessPage = () => {
    const location = useLocation();
    const order = location.state?.order as Order;

    if (!order) {
        return (
            <div className="container mx-auto my-3">
                <div className="relative px-4 py-3 text-center text-red-700 bg-red-100 border border-red-400 rounded" role="alert">
                    <strong className="font-bold">Lỗi!</strong>
                    <span className="block sm:inline"> Không tìm thấy thông tin đơn hàng. Vui lòng thử lại sau.</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container p-4 mx-auto my-3">
            <div className="px-4 py-3 mb-4 text-green-900 bg-green-100 border-t-4 border-green-500 rounded-b shadow-md" role="alert">
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
                                <span className="w-2/3 text-gray-600">{order._id}</span>
                            </div>
                            <div className="flex mb-3">
                                <strong className="w-1/3">Khách hàng:</strong>
                                <span className="w-2/3 text-gray-600">{order.userInfo?.fullName}</span>
                            </div>
                            <div className="flex">
                                <strong className="w-1/3">Số điện thoại:</strong>
                                <span className="w-2/3 text-gray-600">{order.userInfo?.phone}</span>
                            </div>
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
                                                <tr key={index} className="border-b">
                                                    <td className="w-20 p-3">
                                                        <img className="rounded" src={item.productInfo.thumbnail} alt={item.productInfo.title} width="60" height="60" style={{ objectFit: 'cover' }} />
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="font-bold">{item.productInfo.title}</div>
                                                        <div className="text-sm text-gray-500">Đơn giá: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.priceNew)}</div>
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        <span className="text-gray-500">Số lượng: {item.quantity}</span>
                                                    </td>
                                                    <td className="p-3 text-right">
                                                        <div className="font-bold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.totalPrice)}</div>
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
                                <span className="font-bold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalPrice)}</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b">
                                <span>Phí vận chuyển:</span>
                                <span className="text-green-600">Miễn phí</span>
                            </div>
                            <div className="flex items-center justify-between py-3">
                                <strong className="text-gray-800">Tổng thanh toán:</strong>
                                <strong className="text-xl text-red-600">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalPrice)}</strong>
                            </div>
                        </div>
                    </div>

                    {/* Additional info */}
                    <div className="text-center bg-white rounded-lg shadow">
                        <div className="p-4">
                            <div className="mb-3">
                                <Truck className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                                <h6 className="font-semibold">Thời gian giao hàng dự kiến</h6>
                                <p className="text-sm text-gray-500">2-3 ngày làm việc</p>
                            </div>
                            <div className="mb-3">
                                <Phone className="w-8 h-8 mx-auto mb-2 text-green-500" />
                                <h6 className="font-semibold">Chúng tôi sẽ liên hệ</h6>
                                <p className="text-sm text-gray-500">Qua số điện thoại {order.userInfo.phone} để xác nhận đơn hàng</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action buttons */}
            <div className="mt-4">
                <div className="grid grid-cols-1">
                    <Link to="/" className="px-4 py-3 font-bold text-center text-white bg-blue-500 rounded hover:bg-blue-700">
                        Tiếp tục mua sắm
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default CheckoutSuccessPage;
