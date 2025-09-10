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
        clearError,
    };
};

export default useCheckout;