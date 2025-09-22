import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, User, Phone, MapPin } from "lucide-react";
import axios from "axios";

// Define interfaces for the cart data
interface ProductInfo {
  thumbnail: string;
  title: string;
  priceNew: number;
}

interface CartProduct {
  product_id: number;
  quantity: number;
  totalPrice: number;
  productInfo: ProductInfo;
}

interface CartDetail {
  _id?: string;
  products: CartProduct[];
  totalPrice: number;
}

const CheckoutPage = () => {
  const [cartDetail, setCartDetail] = useState<CartDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState({
    fullName: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        // Sử dụng endpoint cũ cho đến khi backend được setup đúng
        const response = await fetch("http://localhost:3000/api/v1/carts", {
          cache: "no-store",
          credentials: "include",
        });
        const result = await response.json();
        
        if (result.code === 200 && result.data) {
          setCartDetail(result.data);
        } else {
          setError(result.message || "Không thể tải giỏ hàng.");
        }
      } catch (err) {
        setError("Đã xảy ra lỗi khi tải giỏ hàng.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserInfo((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cartDetail || cartDetail.products.length === 0) {
      setError("Giỏ hàng trống, không thể đặt hàng.");
      return;
    }

    // Validate form
    if (!userInfo.fullName.trim() || !userInfo.phone.trim() || !userInfo.address.trim()) {
      setError("Vui lòng điền đầy đủ thông tin giao hàng.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await axios.post(
        "http://localhost:3000/api/v1/checkout/order",
        {
          cartId: cartDetail?._id,
          userInfo,
        },
        {
          withCredentials: true,
        }
      );


      if (response.data.code === 200) {
        const order = response.data.data;
        navigate(`/checkout/success/${order._id}`);
      } else {
        setError(response.data.message || "Đặt hàng thất bại.");
      }
    } catch (error) {
      setError(
        error.response?.data?.message || 
        "Đã xảy ra lỗi khi đặt hàng. Vui lòng thử lại."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-3 border-2 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          <p className="text-sm text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!cartDetail || cartDetail.products.length === 0) {
    return (
      <div className="container p-4 mx-auto my-4">
        <div className="py-12 text-center">
          <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <h5 className="text-gray-500">Giỏ hàng trống</h5>
          <p className="text-gray-500">
            Hãy thêm sản phẩm vào giỏ hàng để tiếp tục
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container p-4 mx-auto my-4">
      <div className="mb-4 text-2xl font-bold">Đặt hàng</div>

      {error && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 border border-red-400 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1">
        <div className="bg-white shadow-sm">
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left">STT</th>
                    <th className="px-4 py-2 text-left">Ảnh</th>
                    <th className="px-4 py-2 text-left">Tên sản phẩm</th>
                    <th className="px-4 py-2 text-left">Giá</th>
                    <th className="px-4 py-2 text-center">Số lượng</th>
                    <th className="px-4 py-2 text-left">Tổng tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {cartDetail.products.map((item, index) => (
                    <tr key={item.product_id} className="border-b">
                      <td className="px-4 py-2">{index + 1}</td>
                      <td className="px-4 py-2">
                        <img
                          src={item.productInfo.thumbnail}
                          alt={item.productInfo.title}
                          className="object-cover w-16 h-16 rounded"
                        />
                      </td>
                      <td className="px-4 py-2">{item.productInfo.title}</td>
                      <td className="px-4 py-2 font-bold text-[#323232]">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(item.productInfo.priceNew)}
                      </td>
                      <td className="px-4 py-2 text-center">{item.quantity}</td>
                      <td className="px-4 py-2 font-bold text-[#323232]">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(item.totalPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 text-right">
              <h4 className="text-xl">
                Tổng đơn hàng:
                <span className="ml-2 font-bold text-[#DCB963]">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(cartDetail.totalPrice)}
                </span>
              </h4>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto mt-4">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 text-white bg-[#DCB963] rounded-t-lg">
              <h5 className="text-lg font-semibold">Thông tin giao hàng</h5>
            </div>
            <div className="p-4">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-4 mb-3 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="fullName"
                      className="flex items-center mb-1 text-sm font-medium text-gray-700"
                    >
                      <User className="w-4 h-4 mr-1" /> Họ và tên
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      placeholder="Nhập họ và tên"
                      required
                      value={userInfo.fullName}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 mt-1 placeholder-gray-400 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="phone"
                      className="flex items-center mb-1 text-sm font-medium text-gray-700"
                    >
                      <Phone className="w-4 h-4 mr-1" /> Số điện thoại
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      placeholder="Nhập số điện thoại"
                      required
                      value={userInfo.phone}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 mt-1 placeholder-gray-400 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label
                    htmlFor="address"
                    className="flex items-center mb-1 text-sm font-medium text-gray-700"
                  >
                    <MapPin className="w-4 h-4 mr-1" /> Địa chỉ giao hàng
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    placeholder="Nhập địa chỉ giao hàng"
                    required
                    value={userInfo.address}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 mt-1 placeholder-gray-400 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center justify-center w-full px-4 py-3 font-bold text-white bg-[#323232] rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <div className="w-5 h-5 mr-2 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5 mr-2" /> Đặt hàng ngay
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;