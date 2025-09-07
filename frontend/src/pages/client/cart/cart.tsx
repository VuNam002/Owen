import { useState, useEffect } from 'react';
import { Trash2, Plus, Minus, ShoppingBag, CreditCard } from 'lucide-react';

// Utility function for classnames
const cn = (...classes) => classes.filter(Boolean).join(' ');

// Card Components (from your shadcn/ui)
function Card({ className, ...props }) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

// Main Shopping Cart Component
export default function ShoppingCart() {
  const [cart, setCart] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});

  const API_BASE_URL = 'http://localhost:3000/api/v1/carts';

  const fetchCartItems = async () => {
    try {
      const response = await fetch(API_BASE_URL, { cache: 'no-store', credentials: 'include' });
      const result = await response.json();
      if (result.code === 200 && result.data) {
        setCart(result.data);
        setCartItems(result.data.products || []);
      } else {
        setCart(null);
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error fetching cart items:', error);
      setCart(null);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    setUpdating(prev => ({ ...prev, [productId]: true }));
    try {
      const response = await fetch(`${API_BASE_URL}/update/${productId}/${newQuantity}`, { 
        method: 'PATCH',
        credentials: 'include'
      });
      if (response.ok) {
        fetchCartItems(); // Refetch cart data to get updated totals
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setUpdating(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleRemoveItem = async (productId) => {
    setUpdating(prev => ({ ...prev, [productId]: true }));
    try {
      const response = await fetch(`${API_BASE_URL}/delete/${productId}`, { 
        method: 'DELETE',
        credentials: 'include'
      });
      if (response.ok) {
        await fetchCartItems(); 
      }
    } catch (error) {
      console.error('Error removing item:', error);
    } finally {
      setUpdating(prev => ({ ...prev, [productId]: false }));
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  }

  const calculateItemsCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <p className="text-gray-600">Đang tải giỏ hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="max-w-4xl px-4 mx-auto">
        <div className="mb-8">
          <h1 className="flex items-center gap-3 text-3xl font-bold text-gray-900">
            <ShoppingBag className="w-8 h-8 text-blue-600" />
            Giỏ hàng của bạn
          </h1>
          <p className="mt-2 text-gray-600">
            {cartItems.length > 0 ? `${calculateItemsCount()} sản phẩm` : 'Giỏ hàng trống'}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {cartItems.length === 0 ? (
              <Card className="py-12 text-center">
                <CardContent>
                  <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="mb-2 text-xl font-medium text-gray-900">Giỏ hàng trống</h3>
                  <p className="mb-6 text-gray-500">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
                  <button className="px-6 py-3 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700">
                    Tiếp tục mua sắm
                  </button>
                </CardContent>
              </Card>
            ) : (
              cartItems.map((item) => (
                <Card key={item.product_id} className="p-0">
                  <CardContent className="p-0">
                    <div className="flex items-center gap-4 p-6">
                      <img
                        src={item.productInfo?.thumbnail || 'https://via.placeholder.com/80'}
                        alt={item.productInfo?.title}
                        className="object-cover w-20 h-20 rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900">{item.productInfo?.title}</h3>
                        <p className="mt-1 text-sm text-gray-500">{item.productInfo?.description}</p>
                        <p className="mt-2 text-lg font-semibold text-blue-600">
                          {formatPrice(item.totalPrice)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleQuantityChange(item.product_id, item.quantity - 1)}
                          disabled={item.quantity <= 1 || updating[item.product_id]}
                          className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 font-medium text-center">
                          {updating[item.product_id] ? '...' : item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.product_id, item.quantity + 1)}
                          disabled={updating[item.product_id]}
                          className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.product_id)}
                        disabled={updating[item.product_id]}
                        className="p-2 text-red-500 rounded-full hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {cartItems.length > 0 && cart && (
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle>Tổng đơn hàng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Tạm tính:</span>
                    <span>{formatPrice(cart.totalPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phí vận chuyển:</span>
                    <span>{formatPrice(0)}</span>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Tổng cộng:</span>
                      <span className="text-blue-600">{formatPrice(cart.totalPrice)}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex-col gap-3">
                  <button className="flex items-center justify-center w-full gap-2 py-3 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700">
                    <CreditCard className="w-5 h-5" />
                    Thanh toán
                  </button>
                  <button className="w-full py-3 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50">
                    Tiếp tục mua sắm
                  </button>
                </CardFooter>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}