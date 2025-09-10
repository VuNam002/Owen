import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
 
interface Product {
  product_id: string;
  quantity: number;
  discountPercentage: number;
  price: number;
}

interface Order {
  _id: string;
  cart_id: string;
  user_id: string;
  status: string;
  userInfo: {
    fullName: string;
    phone: string;
    address: string;
  };
  products: Product[];
  createdAt: string;
  updatedAt: string;
}

const API_BASE = "http://localhost:3000/api/v1";

const DetailOrderPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const res = await fetch(`${API_BASE}/${endpoint}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
  };

  useEffect(() => {
    const loadOrder = async () => {
      setLoading(true);
      try {
        const orderRes = await apiCall(`checkout/success/${orderId}`);
        setOrder(orderRes.data);
      } catch{
        setError("Không thể tải dữ liệu đơn hàng");
      } finally {
        setLoading(false);
      }
    };
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-lg">Đang tải...</div></div>;
  }

  if (error) {
    return <div className="px-4 py-3 mb-4 text-red-700 bg-red-100 border border-red-400 rounded">{error}</div>;
  }

  if (!order) {
    return <div className="flex items-center justify-center h-64"><div className="text-lg">Không tìm thấy đơn hàng</div></div>;
  }

  return (
    <div className="container px-4 py-6 mx-auto">
      <div className="max-w-4xl mx-auto">
        <h1 className="mb-6 text-2xl font-bold">Chi tiết đơn hàng:  #{order._id}</h1>

        <div className="p-6 mb-6 bg-white rounded-lg shadow">
          <h2 className="mb-4 text-lg font-semibold">Thông tin khách hàng</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-gray-600">Họ và tên</p>
              <p className="font-medium">{order.userInfo.fullName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Số điện thoại</p>
              <p className="font-medium">{order.userInfo.phone}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600">Địa chỉ</p>
              <p className="font-medium">{order.userInfo.address}</p>
            </div>
          </div>
        </div>

        <div className="p-6 mb-6 bg-white rounded-lg shadow">
          <h2 className="mb-4 text-lg font-semibold">Thông tin đơn hàng</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-gray-600">Mã đơn hàng</p>
              <p className="font-medium">{order._id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Trạng thái</p>
              <p className="font-medium">{order.status}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Ngày tạo</p>
              <p className="font-medium">{new Date(order.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Ngày cập nhật</p>
              <p className="font-medium">{new Date(order.updatedAt).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="mb-4 text-lg font-semibold">Sản phẩm</h2>
          <table className="w-full">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Sản phẩm</th>
                <th className="px-4 py-2 text-right">Số lượng</th>
                <th className="px-4 py-2 text-right">Giá</th>
                <th className="px-4 py-2 text-right">Giảm giá</th>
                <th className="px-4 py-2 text-right">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {order.products.map((product) => (
                <tr key={product.product_id}>
                  <td className="px-4 py-2">{product.product_id}</td>
                  <td className="px-4 py-2 text-right">{product.quantity}</td>
                  <td className="px-4 py-2 text-right">{product.price.toLocaleString()}đ</td>
                  <td className="px-4 py-2 text-right">{product.discountPercentage}%</td>
                  <td className="px-4 py-2 text-right">
                    {(product.price * product.quantity * (1 - product.discountPercentage / 100)).toLocaleString()}đ
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DetailOrderPage;