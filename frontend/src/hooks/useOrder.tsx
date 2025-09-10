import { useState, useCallback } from 'react';

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
    status?: string; // Thêm trạng thái đơn hàng
}

interface CreateOrderData {
    userInfo: UserInfo;
    products: Product[];
    totalPrice: number;
}

const useCheckout = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
            // Không set loading = true để tránh hiển thị loading screen toàn trang
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
            
            // Kiểm tra response thành công
            if (result.code === 200) {
                // Nếu có data, trả về data. Nếu không có data nhưng thành công, tạo object giả
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

    // Hàm tiện ích để toggle trạng thái giữa active/inactive
    const toggleOrderStatus = useCallback(async (
        orderId: string,
        currentStatus: string
    ): Promise<Order | null> => {
        const newStatus = currentStatus === "active" ? "inactive" : "active";
        return updateOrderStatus(orderId, newStatus);
    }, [updateOrderStatus]);

    // Reset error
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        loading,
        error,
        createOrder,
        getOrderById,
        getAllOrders,
        updateOrderStatus,
        toggleOrderStatus,
        clearError,
    };
};

export default useCheckout;