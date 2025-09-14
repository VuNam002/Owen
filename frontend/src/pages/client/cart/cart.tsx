import { useState, useEffect } from "react";
import { Trash2, Plus, Minus, ShoppingBag, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";

interface CartItem {
  product_id: number;
  quantity: number;
  totalPrice: number;
  productInfo: {
    title: string;
    description: string;
    thumbnail: string;
  };
}

interface Cart {
  products: CartItem[];
  totalPrice: number;
}

// Utility function for classnames
const cn = (...classes: (string | undefined | false)[]) =>
  classes.filter(Boolean).join(" ");

// Card Components (from shadcn/ui)
function Card({
  className,
  ...props
}: {
  className?: string;
  [key: string]: any;
}) {
  return (
    <div
      className={cn("bg-white rounded-xl border shadow-sm", className)}
      {...props}
    />
  );
}

function CardHeader({
  className,
  ...props
}: {
  className?: string;
  [key: string]: any;
}) {
  return <div className={cn("p-4 pb-2", className)} {...props} />;
}

function CardTitle({
  className,
  ...props
}: {
  className?: string;
  [key: string]: any;
}) {
  return (
    <h3
      className={cn("text-lg font-semibold text-gray-900", className)}
      {...props}
    />
  );
}

function CardContent({
  className,
  ...props
}: {
  className?: string;
  [key: string]: any;
}) {
  return <div className={cn("p-4 pt-0", className)} {...props} />;
}

function CardFooter({
  className,
  ...props
}: {
  className?: string;
  [key: string]: any;
}) {
  return <div className={cn("p-4 pt-0", className)} {...props} />;
}

// Main Shopping Cart Component
export default function ShoppingCart() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<Record<number, boolean>>({});

  const API_BASE_URL = "http://localhost:3000/api/v1/carts";

  const fetchCartItems = async () => {
    try {
      const response = await fetch(API_BASE_URL, {
        cache: "no-store",
        credentials: "include",
      });
      const result = await response.json();
      if (result.code === 200 && result.data) {
        setCart(result.data);
        setCartItems(result.data.products || []);
      } else {
        setCart(null);
        setCartItems([]);
      }
    } catch (error) {
      console.error("Error fetching cart items:", error);
      setCart(null);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    fetchCartItems();
  }, []);

  const handleQuantityChange = async (
    productId: number,
    newQuantity: number
  ) => {
    if (newQuantity < 1) return;

    setUpdating((prev) => ({ ...prev, [productId]: true }));
    try {
      const response = await fetch(
        `${API_BASE_URL}/update/${productId}/${newQuantity}`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );
      if (response.ok) {
        fetchCartItems();
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
    } finally {
      setUpdating((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const handleRemoveItem = async (productId: number) => {
    setUpdating((prev) => ({ ...prev, [productId]: true }));
    try {
      const response = await fetch(`${API_BASE_URL}/delete/${productId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (response.ok) {
        await fetchCartItems();
      }
    } catch (error) {
      console.error("Error removing item:", error);
    } finally {
      setUpdating((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const calculateItemsCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
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

  return (
    <div className="justify-center w-full min-h-screen py-8 bg-gray-50">
      <div className="max-w-5xl px-4 mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <ShoppingBag className="w-6 h-6 text-[#DCB963]" />
            <h1 className="text-2xl font-bold text-gray-900">Giỏ hàng</h1>
          </div>
          <p className="text-sm text-gray-600">
            {cartItems.length > 0
              ? `${calculateItemsCount()} sản phẩm`
              : "Giỏ hàng trống"}
          </p>
        </div>

        <div className="grid justify-center grid-cols-1 gap-6">
          <div className="space-y-3 lg:col-span-2 ">
            {cartItems.length === 0 ? (
              <Card className="py-8 text-center">
                <CardContent>
                  <ShoppingBag className="justify-center w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <h3 className="mb-1 text-lg font-medium text-gray-900">
                    Giỏ hàng trống
                  </h3>
                  <p className="mb-4 text-sm text-gray-500">
                    Bạn chưa có sản phẩm nào trong giỏ hàng
                  </p>
                  <Link to="/">
                    <button className="px-4 py-2 text-sm text-white transition-colors bg-[#323232] rounded-lg ">
                      Tiếp tục mua sắm
                    </button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              cartItems.map((item) => (
                <Card key={item.product_id}>
                  <CardContent className="p-2">
                    <div className="flex items-center justify-between gap-4">
                      {/* Product Image */}
                      <img
                        src={item.productInfo?.thumbnail}
                        alt={item.productInfo?.title}
                        className="object-cover rounded-lg flex-shrink-1 w-18 h-18 "
                      />

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 line-clamp-1">
                          {item.productInfo?.title}
                        </h3>
                        <p className="mt-2 text-sm font-semibold text-[#333F48]">
                          {formatPrice(item.totalPrice)}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-center gap-1 p-1 bg-gray-100 rounded-lg">
                        <button
                          onClick={() =>
                            handleQuantityChange(
                              item.product_id,
                              item.quantity - 1
                            )
                          }
                          disabled={
                            item.quantity <= 1 || updating[item.product_id]
                          }
                          className="flex items-center justify-center transition-colors rounded-md w-7 h-7 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-sm font-medium text-center">
                          {updating[item.product_id] ? "..." : item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            handleQuantityChange(
                              item.product_id,
                              item.quantity + 1
                            )
                          }
                          disabled={updating[item.product_id]}
                          className="flex items-center justify-center transition-colors rounded-md w-7 h-7 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveItem(item.product_id)}
                        disabled={updating[item.product_id]}
                        className="flex items-center justify-center w-8 h-8 text-red-500 transition-colors rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Order Summary */}
          {cartItems.length > 0 && cart && (
            <div className="space-y-3 lg:col-span-2 j ">
              <Card className="sticky top-6 ">
                <CardHeader>
                  <CardTitle>Tổng đơn hàng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tạm tính:</span>
                    <span className="font-medium">
                      {formatPrice(cart.totalPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Phí vận chuyển:</span>
                    <span className="font-medium">Miễn phí</span>
                  </div>
                  <hr className="my-3" />
                  <div className="flex justify-between">
                    <span className="font-semibold">Tạm tính:</span>
                    <span className="text-lg font-bold text-[#333F48]">
                      {formatPrice(cart.totalPrice)}
                    </span>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-3 p-4">
                  <Link to="/checkout">
                    <button className="flex items-center justify-center w-full gap-2 py-3 text-white transition-colors bg-[#323232] ">
                      <CreditCard className="w-4 h-4" />
                      Thanh toán
                    </button>
                  </Link>
                  <Link to="/products">
                    <button className="w-full py-2 text-sm transition-colors border border-gray-300 ">
                      Tiếp tục mua sắm
                    </button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
