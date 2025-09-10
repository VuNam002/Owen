import { useState, useCallback, useMemo } from 'react';

interface UserInfo {
    fullName: string;
    phone: string;
}

interface ProductInfo {
    thumbnail: string;
    title: string;
}

interface Product {
    product_id: string;
    price: number;
    discountPercentage: number;
    quantity: number;
    productInfo?: ProductInfo;
    priceNew?: number;
    totalPrice?: number;
}

interface Order {
    _id: string;
    userInfo: UserInfo;
    products: Product[];
    totalPrice: number;
    status?: string;
}

interface CreateOrderData {
    userInfo: UserInfo;
    products: Product[];
    totalPrice: number;
}

const useCheckout = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>("");
    const [orders, setOrders] = useState<Order[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    const BASE_URL = 'http://localhost:3000/api/v1/checkout';

    // POST /order - Tạo đơn hàng
    const createOrder = useCallback(async (orderData: CreateOrderData): Promise<Order | null> => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${BASE_URL}/order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Không thể tạo đơn hàng.");
            }

            const result = await response.json();
            
            if (result.code === 200 && result.data) {
                // Cập nhật danh sách orders sau khi tạo thành công
                setOrders(prev => [result.data, ...prev]);
                return result.data;
            } else {
                throw new Error(result.message || "Lỗi khi tạo đơn hàng.");
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Đã xảy ra lỗi khi tạo đơn hàng.";
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    // GET /success/:orderId - Lấy thông tin đơn hàng theo ID
    const getOrderById = useCallback(async (orderId: string): Promise<Order | null> => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${BASE_URL}/success/${orderId}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Không thể tải thông tin đơn hàng.");
            }

            const result = await response.json();
            
            if (result.code === 200 && result.data) {
                return result.data;
            } else {
                throw new Error(result.message || "Không tìm thấy thông tin đơn hàng.");
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Đã xảy ra lỗi khi tải đơn hàng.";
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    // GET / - Lấy danh sách đơn hàng
    const getAllOrders = useCallback(async (): Promise<Order[] | null> => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${BASE_URL}/`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Không thể tải danh sách đơn hàng.");
            }

            const result = await response.json();
            
            if (result.code === 200 && result.data) {
                setOrders(result.data);
                return result.data;
            } else {
                throw new Error(result.message || "Không tìm thấy danh sách đơn hàng.");
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Đã xảy ra lỗi khi tải danh sách đơn hàng.";
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    // PATCH - Thay đổi trạng thái đơn hàng
    const updateOrderStatus = useCallback(async (
        orderId: string,
        newStatus: string
    ): Promise<Order | null> => {
        try {
            setError(null);

            const response = await fetch(`${BASE_URL}/change-status/${newStatus}/${orderId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Không thể cập nhật trạng thái đơn hàng.");
            }

            const result = await response.json();
            
            if (result.code === 200) {
                // Cập nhật trạng thái trong danh sách orders
                setOrders(prev => 
                    prev.map(order => 
                        order._id === orderId 
                            ? { ...order, status: newStatus }
                            : order
                    )
                );

                return result.data || { 
                    _id: orderId, 
                    status: newStatus, 
                    userInfo: { fullName: '', phone: '' }, 
                    products: [], 
                    totalPrice: 0 
                };
            } else {
                throw new Error(result.message || "Lỗi khi cập nhật trạng thái đơn hàng.");
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Đã xảy ra lỗi khi cập nhật trạng thái.";
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    }, []);

    const toggleOrderStatus = useCallback(async (
        orderId: string,
        currentStatus: string
    ): Promise<Order | null> => {
        const newStatus = currentStatus === "active" ? "inactive" : "active";
        return updateOrderStatus(orderId, newStatus);
    }, [updateOrderStatus]);

    const filteredOrders = useMemo(() => {
        if (!filterStatus || filterStatus === "all") {
            return orders;
        }
        return orders.filter(order => order.status === filterStatus);
    }, [orders, filterStatus]);

    // Lấy danh sách các status có sẵn
    const availableStatuses = useMemo(() => {
        const statuses = Array.from(new Set(orders.map(order => order.status).filter(Boolean)));
        return statuses.sort();
    }, [orders]);
    const statusCount = useMemo(() => {
        const count: Record<string, number> = {};
        orders.forEach(order => {
            if (order.status) {
                count[order.status] = (count[order.status] || 0) + 1;
            }
        });
        return count;
    }, [orders]);

    const setStatusFilter = useCallback((status: string) => {
        setFilterStatus(status);
    }, []);

    const clearStatusFilter = useCallback(() => {
        setFilterStatus("");
    }, []);
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const totalItems = filteredOrders.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handlePrePage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };


    return {
        loading,
        error,
        orders,
        filteredOrders,
        filterStatus,
        availableStatuses,
        statusCount,
        currentPage,
        totalPages,
        totalItems,
        itemsPerPage,
        handlePageChange,
        handlePrePage,
        handleNextPage,
        createOrder,
        getOrderById,
        getAllOrders,
        updateOrderStatus,
        toggleOrderStatus,
        setStatusFilter,
        clearStatusFilter,
        clearError,
    };
};

export default useCheckout;