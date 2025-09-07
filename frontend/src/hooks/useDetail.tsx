import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";

interface Comment {
  _id: string;
  fullName: string;
  email: string;
  content: string;
  createdAt: string;
}

interface Product {
  _id: string;
  title: string;
  price: number;
  thumbnail: string;
  oldPrice?: number;
  discountPercentage?: number;
  status: string;
  description: string;
  size: string;
  color: string;
  stock: number;
  slug: string;
  product_category_id: {
    _id: string;
    title: string;
  };
  comments?: Comment[];
  totalComments?: number;
}

const COLOR_OPTIONS = [
  { value: "red", label: "Đỏ", hex: "#FF0000" },
  { value: "blue", label: "Xanh dương", hex: "#0000FF" },
  { value: "green", label: "Xanh lá", hex: "#008000" },
  { value: "yellow", label: "Vàng", hex: "#FFFF00" },
  { value: "purple", label: "Tím", hex: "#800080" },
  { value: "orange", label: "Cam", hex: "#FFA500" },
];

const mockImages = [
  "https://via.placeholder.com/400x400/4F46E5/ffffff?text=Product+1",
  "https://via.placeholder.com/400x400/7C3AED/ffffff?text=Product+2",
  "https://via.placeholder.com/400x400/DC2626/ffffff?text=Product+3",
  "https://via.placeholder.com/400x400/059669/ffffff?text=Product+4",
];

export const useProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [isWishlisted, setIsWishlisted] = useState<boolean>(false);
  
  // Comment states
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentForm, setCommentForm] = useState({
    fullName: "",
    email: "",
    content: ""
  });
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);

  // Helper functions
  const parseJsonArray = (jsonStr: string) => {
    try {
      return JSON.parse(jsonStr);
    } catch {
      return [];
    }
  };

  const availableColors = product?.color ? parseJsonArray(product.color) : [];
  const availableSizes = product?.size ? parseJsonArray(product.size) : [];

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  const getColorInfo = (colorValue: string) => {
    const predefinedColor = COLOR_OPTIONS.find((c) => c.value === colorValue);
    return {
      hex: predefinedColor?.hex || colorValue,
      label: predefinedColor?.label || colorValue,
    };
  };

  const hasDiscount = () => product && (product.oldPrice || product.discountPercentage);
  
  // Giá sau khi giảm
  const calculateDiscountedPrice = () => {
    if (!product) return 0;
    if (product.oldPrice && product.discountPercentage) {
      return product.oldPrice * (1 - product.discountPercentage / 100);
    }
    if (product.discountPercentage) {
      return product.price * (1 - product.discountPercentage / 100);
    }
    return product.oldPrice ? product.price : product.price;
  };

  const calculateSavings = () => {
    if (!product || !hasDiscount()) return 0;
    const originalPrice = product.oldPrice || product.price;
    return originalPrice - calculateDiscountedPrice();
  };

  const getDiscountPercent = () => {
    if (!product) return 0;
    return product.discountPercentage || 
           (product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0);
  };

  // Event handlers
  const handleQuantityChange = (type: "increase" | "decrease") => {
    if (type === "increase" && quantity < (product?.stock || 0)) {
      setQuantity(prev => prev + 1);
    } else if (type === "decrease" && quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    if (availableSizes.length > 0 && !selectedSize) {
      toast.error("Vui lòng chọn size!");
      return;
    }
    if (availableColors.length > 0 && !selectedColor) {
      toast.error("Vui lòng chọn màu sắc!");
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/v1/carts/add/${product._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity: quantity }),
        credentials: 'include', // Thêm dòng này
      });

      const result = await response.json();

      if (result.code === 200) {
        toast.success(`Đã thêm ${quantity} sản phẩm "${product.title}" vào giỏ hàng!`);
        return true; // Trả về true nếu thành công
      } else {
        toast.error(result.message || 'Có lỗi xảy ra khi thêm vào giỏ hàng.');
        return false; // Trả về false nếu thất bại
      }
    } catch (error) {
      console.error('Lỗi khi thêm vào giỏ hàng:', error);
      toast.error('Không thể kết nối đến server. Vui lòng thử lại.');
      return false; // Trả về false nếu thất bại
    }
  };

  const handleWishlistToggle = () => {
    setIsWishlisted(!isWishlisted);
  };

  // Comment handlers
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!product?.slug) {
      toast.error("Không thể thêm bình luận lúc này");
      return;
    }

    if (!commentForm.fullName.trim() || !commentForm.email.trim() || !commentForm.content.trim()) {
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(commentForm.email)) {
      toast.error("Email không hợp lệ!");
      return;
    }

    setIsSubmittingComment(true);

    try {
      const response = await fetch(`http://localhost:3000/api/v1/products/create-comment/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(commentForm),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const newComment: Comment = {
          _id: result.data._id,
          fullName: commentForm.fullName,
          email: commentForm.email,
          content: commentForm.content,
          createdAt: new Date().toISOString(),
        };
        
        setComments(prev => [newComment, ...prev]);
        
        // Reset form
        setCommentForm({
          fullName: "",
          email: "",
          content: ""
        });
        
        setShowCommentForm(false);
        toast.success("Đã thêm bình luận thành công!");
      } else {
        toast.error(result.message || "Có lỗi xảy ra khi thêm bình luận");
      }
    } catch (error) {
      console.error("Lỗi khi thêm bình luận:", error);
      toast.error("Có lỗi xảy ra khi thêm bình luận");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleCommentFormChange = (field: string, value: string) => {
    setCommentForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleCommentForm = () => {
    setShowCommentForm(!showCommentForm);
  };

  // Effects
  useEffect(() => {
    if (!id) {
      setError("Không tìm thấy ID sản phẩm");
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`http://localhost:3000/api/v1/products/detail/${id}`);
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const result = await response.json();
        if (!result.data) throw new Error("Không có dữ liệu sản phẩm");
        
        setProduct(result.data);
        setComments(result.data.comments || []);
        setSelectedImage(result.data.thumbnail || mockImages[0]);
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm:", error);
        setError(error instanceof Error ? error.message : "Có lỗi xảy ra");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product) {
      if (availableColors.length > 0 && !selectedColor) {
        setSelectedColor(availableColors[0]);
      }
      if (availableSizes.length > 0 && !selectedSize) {
        setSelectedSize(availableSizes[0]);
      }
    }
  }, [product, availableColors, availableSizes, selectedColor, selectedSize]);

  return {
    // Data
    product,
    loading,
    error,
    selectedSize,
    selectedColor,
    quantity,
    selectedImage,
    isWishlisted,
    comments,
    commentForm,
    isSubmittingComment,
    showCommentForm,
    mockImages,
    
    // Computed values
    availableColors,
    availableSizes,
    
    // Helper functions
    formatPrice,
    formatDate,
    getColorInfo,
    hasDiscount,
    calculateDiscountedPrice,
    calculateSavings,
    getDiscountPercent,
    
    // Handlers
    handleQuantityChange,
    handleAddToCart,
    handleWishlistToggle,
    handleCommentSubmit,
    handleCommentFormChange,
    toggleCommentForm,
    setSelectedSize,
    setSelectedColor,
    setSelectedImage,
  };
};