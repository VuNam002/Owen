import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useCheckout from '../../../hooks/useOrder';
import { Loader, Eye, Package, User, Calendar, DollarSign } from 'lucide-react';

const AdminOrderListPage: React.FC = () => {
    const { getAllOrders, loading, error, clearError } = useCheckout();
    const [orders, setOrders] = React.useState<any[]>([]);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('vi-VN');
    };

    const loadOrders = async () => {
        try {
            const ordersData = await getAllOrders();
            if (ordersData) {
                setOrders(ordersData);
            }
        } catch (err) {
            console.error('Lỗi khi tải danh sách đơn hàng:', err);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <Loader className="w-10 h-10 mx-auto mb-3 text-blue-500 animate-spin" />
                    <p className="text-lg text-gray-600">Đang tải danh sách đơn hàng...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto my-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                <p className="font-bold">Lỗi:</p>
                <p>{error}</p>
                <div className="mt-4">
                    <button 
                        onClick={() => {
                            clearError();
                            loadOrders();
                        }}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto my-8 p-6 bg-white rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Quản lý Đơn hàng</h1>
                    <p className="text-gray-600 mt-2">Tổng số đơn hàng: {orders.length}</p>
                </div>
                <button 
                    onClick={loadOrders}
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                    {loading ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Làm mới
                </button>
            </div>

            {orders.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Không có đơn hàng nào</h3>
                    <p className="text-gray-500">Hiện tại chưa có đơn hàng nào được tạo.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Mã đơn hàng</th>
                                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Khách hàng</th>
                                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Số điện thoại</th>
                                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Số sản phẩm</th>
                                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Tổng tiền</th>
                                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Trạng thái</th>
                                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Ngày tạo</th>
                                <th className="py-3 px-4 text-center text-xs font-semibold text-gray-600 uppercase">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order, index) => (
                                <tr key={order._id || index} className="border-b border-gray-200 hover:bg-gray-50 last:border-b-0">
                                    <td className="py-3 px-4">
                                        <div className="flex items-center">
                                            <Package className="w-4 h-4 mr-2 text-blue-500" />
                                            <span className="text-sm font-medium text-gray-900">
                                                #{order._id?.substring(0, 8) || `ORD-${index + 1}`}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center">
                                            <User className="w-4 h-4 mr-2 text-gray-500" />
                                            <span className="text-sm text-gray-900">
                                                {order.userInfo?.fullName || 'Không xác định'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-sm text-gray-900">
                                        {order.userInfo?.phone || 'N/A'}
                                    </td>
                                    <td className="py-3 px-4 text-sm text-gray-900">
                                        {order.products?.length || 0} sản phẩm
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center">
                                            <DollarSign className="w-4 h-4 mr-1 text-green-500" />
                                            <span className="text-sm font-semibold text-gray-900">
                                                {formatPrice(order.totalPrice || 0)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                            order.status === 'completed' 
                                                ? 'bg-green-100 text-green-800' 
                                                : order.status === 'cancelled'
                                                ? 'bg-red-100 text-red-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {order.status === 'completed' ? 'Hoàn thành' :
                                             order.status === 'cancelled' ? 'Đã hủy' :
                                             order.status || 'Đang xử lý'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center text-sm text-gray-500">
                                            <Calendar className="w-4 h-4 mr-1" />
                                            {order.createdAt ? formatDate(order.createdAt) : 'N/A'}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <Link 
                                            to={`/admin/orders/${order._id}`}
                                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            <Eye className="w-4 h-4 mr-1" />
                                            Xem chi tiết
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Summary Statistics */}
            {orders.length > 0 && (
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                        <div className="flex items-center">
                            <Package className="w-8 h-8 text-blue-500 mr-3" />
                            <div>
                                <p className="text-sm font-medium text-blue-600">Tổng đơn hàng</p>
                                <p className="text-2xl font-bold text-blue-900">{orders.length}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                        <div className="flex items-center">
                            <DollarSign className="w-8 h-8 text-green-500 mr-3" />
                            <div>
                                <p className="text-sm font-medium text-green-600">Tổng doanh thu</p>
                                <p className="text-2xl font-bold text-green-900">
                                    {formatPrice(orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0))}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                        <div className="flex items-center">
                            <User className="w-8 h-8 text-yellow-500 mr-3" />
                            <div>
                                <p className="text-sm font-medium text-yellow-600">Khách hàng</p>
                                <p className="text-2xl font-bold text-yellow-900">
                                    {new Set(orders.map(order => order.userInfo?.phone)).size}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrderListPage;