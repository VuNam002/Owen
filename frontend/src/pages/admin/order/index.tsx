import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useCheckout from '../../../hooks/useOrder';
import { Loader, Eye, Package, User, Calendar, DollarSign, Check } from 'lucide-react';

const AdminOrderListPage: React.FC = () => {
    const { getAllOrders, updateOrderStatus, loading, error, clearError } = useCheckout();
    const [orders, setOrders] = useState<any[]>([]);
    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

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

    // 3 trạng thái cycle: pending → shipping → completed → pending
    const getStatusCycle = () => [
        { value: 'pending', label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' },
        { value: 'shipping', label: 'Đang giao', color: 'bg-blue-100 text-blue-800 hover:bg-blue-200' },
        { value: 'completed', label: 'Hoàn thành', color: 'bg-green-100 text-green-800 hover:bg-green-200' }
    ];

    const getStatusDisplay = (status: string) => {
        const statusOption = getStatusCycle().find(option => option.value === status);
        return statusOption || getStatusCycle()[0]; // Default to pending nếu không tìm thấy
    };

    const getNextStatus = (currentStatus: string) => {
        const statusCycle = getStatusCycle();
        const currentIndex = statusCycle.findIndex(status => status.value === currentStatus);
        const nextIndex = (currentIndex + 1) % statusCycle.length;
        return statusCycle[nextIndex].value;
    };

    const handleStatusClick = async (orderId: string, currentStatus: string) => {
        try {
            setUpdatingStatus(orderId);
            const nextStatus = getNextStatus(currentStatus);
            const updatedOrder = await updateOrderStatus(orderId, nextStatus);
            
            if (updatedOrder) {
                // Cập nhật state local
                setOrders(prevOrders => 
                    prevOrders.map(order => 
                        order._id === orderId 
                            ? { ...order, status: nextStatus }
                            : order
                    )
                );
            }
        } catch (err) {
            console.error('Lỗi khi cập nhật trạng thái:', err);
        } finally {
            setUpdatingStatus(null);
        }
    };

    const StatusButton: React.FC<{ order: any }> = ({ order }) => {
        const statusInfo = getStatusDisplay(order.status);
        const isUpdating = updatingStatus === order._id;

        return (
            <button
                onClick={() => handleStatusClick(order._id, order.status)}
                disabled={isUpdating}
                className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full transition-colors cursor-pointer ${statusInfo.color} disabled:opacity-50 disabled:cursor-not-allowed`}
                title={`Bấm để chuyển sang trạng thái tiếp theo`}
            >
                {isUpdating ? (
                    <>
                        <Loader className="w-3 h-3 mr-1 animate-spin" />
                        Đang cập nhật...
                    </>
                ) : (
                    statusInfo.label
                )}
            </button>
        );
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
            <div className="container p-4 mx-auto my-8 text-red-700 bg-red-100 border border-red-400 rounded-lg">
                <p className="font-bold">Lỗi:</p>
                <p>{error}</p>
                <div className="mt-4">
                    <button 
                        onClick={() => {
                            clearError();
                            loadOrders();
                        }}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container p-6 mx-auto my-8 bg-white rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Quản lý Đơn hàng</h1>
                    <p className="mt-2 text-gray-600">Tổng số đơn hàng: {orders.length}</p>
                </div>
                <button 
                    onClick={loadOrders}
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                    {loading ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Làm mới
                </button>
            </div>

            {orders.length === 0 ? (
                <div className="py-12 text-center rounded-lg bg-gray-50">
                    <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="mb-2 text-lg font-medium text-gray-900">Không có đơn hàng nào</h3>
                    <p className="text-gray-500">Hiện tại chưa có đơn hàng nào được tạo.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="px-4 py-3 text-xs font-semibold text-left text-gray-600 uppercase">Mã đơn hàng</th>
                                <th className="px-4 py-3 text-xs font-semibold text-left text-gray-600 uppercase">Khách hàng</th>
                                <th className="px-4 py-3 text-xs font-semibold text-left text-gray-600 uppercase">Số điện thoại</th>
                                <th className="px-4 py-3 text-xs font-semibold text-left text-gray-600 uppercase">Số sản phẩm</th>
                                <th className="px-4 py-3 text-xs font-semibold text-left text-gray-600 uppercase">Tổng tiền</th>
                                <th className="px-4 py-3 text-xs font-semibold text-left text-gray-600 uppercase">Trạng thái</th>
                                <th className="px-4 py-3 text-xs font-semibold text-left text-gray-600 uppercase">Ngày tạo</th>
                                <th className="px-4 py-3 text-xs font-semibold text-center text-gray-600 uppercase">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order, index) => (
                                <tr key={order._id || index} className="border-b border-gray-200 hover:bg-gray-50 last:border-b-0">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center">
                                            <Package className="w-4 h-4 mr-2 text-blue-500" />
                                            <span className="text-sm font-medium text-gray-900">
                                                #{order._id?.substring(0, 8) || `ORD-${index + 1}`}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center">
                                            <User className="w-4 h-4 mr-2 text-gray-500" />
                                            <span className="text-sm text-gray-900">
                                                {order.userInfo?.fullName || 'Không xác định'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                        {order.userInfo?.phone || 'N/A'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                        {order.products?.length || 0} sản phẩm
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center">
                                            <DollarSign className="w-4 h-4 mr-1 text-green-500" />
                                            <span className="text-sm font-semibold text-gray-900">
                                                {formatPrice(order.totalPrice || 0)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <StatusButton order={order} />
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center text-sm text-gray-500">
                                            <Calendar className="w-4 h-4 mr-1" />
                                            {order.createdAt ? formatDate(order.createdAt) : 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <Link 
                                            to={`/admin/orders/${order._id}`}
                                            className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-600 border border-transparent rounded-md hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
                <div className="grid grid-cols-1 gap-6 mt-8 md:grid-cols-4">
                    <div className="p-6 border border-blue-200 rounded-lg bg-blue-50">
                        <div className="flex items-center">
                            <Package className="w-8 h-8 mr-3 text-blue-500" />
                            <div>
                                <p className="text-sm font-medium text-blue-600">Tổng đơn hàng</p>
                                <p className="text-2xl font-bold text-blue-900">{orders.length}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-6 border border-green-200 rounded-lg bg-green-50">
                        <div className="flex items-center">
                            <DollarSign className="w-8 h-8 mr-3 text-green-500" />
                            <div>
                                <p className="text-sm font-medium text-green-600">Tổng doanh thu</p>
                                <p className="text-2xl font-bold text-green-900">
                                    {formatPrice(orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0))}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-6 border border-yellow-200 rounded-lg bg-yellow-50">
                        <div className="flex items-center">
                            <User className="w-8 h-8 mr-3 text-yellow-500" />
                            <div>
                                <p className="text-sm font-medium text-yellow-600">Khách hàng</p>
                                <p className="text-2xl font-bold text-yellow-900">
                                    {new Set(orders.map(order => order.userInfo?.phone)).size}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border border-purple-200 rounded-lg bg-purple-50">
                        <div className="flex items-center">
                            <Check className="w-8 h-8 mr-3 text-purple-500" />
                            <div>
                                <p className="text-sm font-medium text-purple-600">Đã hoàn thành</p>
                                <p className="text-2xl font-bold text-purple-900">
                                    {orders.filter(order => order.status === 'completed').length}
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