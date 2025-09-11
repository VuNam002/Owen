import { useState, useEffect, useRef, useCallback } from "react";

type Featured = "0" | "1";

interface Product {
  _id: string;
  title: string;
  thumbnail: string;
  price: number;
  discountPercentage?: number;
  priceNew?: number; // Giá sau khi tính toán từ helper
  status: string;
  featured: Featured;
  product_category_id: string;
  position: number;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  _id: string;
  title: string;
  thumbnail?: string;
  description?: string;
  status: string;
  deleted: boolean;
  parent_id: string;
  position?: number;
  products?: Product[]; 
}

interface Article {
  _id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  status: string;
  featured: Featured;
  deleted: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
}

interface HomeApiResponse {
  success: boolean;
  data: {
    productsFeatured: Product[];
    productsNew: Product[];
    categories: Category[];
    articlesFeatured: Article[];
  };
}

const API_BASE = "http://localhost:3000/api/v1/home";

const apiRequest = async (
  url: string,
  options: RequestInit = {}
): Promise<HomeApiResponse> => {
  const response = await fetch(url, {
    headers: { "Content-type": "application/json" },
    ...options,
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

export const HooksHome = () => {
  const [productsFeatured, setProductsFeatured] = useState<Product[]>([]);
  const [productsNew, setProductsNew] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [articlesFeatured, setArticlesFeatured] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadingRef = useRef(false);

  const fetchHome = useCallback(async () => {
    if (loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const result = await apiRequest(API_BASE);
      
      if (result.success) {
        setProductsFeatured(result.data.productsFeatured || []);
        setProductsNew(result.data.productsNew || []);
        setCategories(result.data.categories || []);
        setArticlesFeatured(result.data.articlesFeatured || []);
      } else {
        throw new Error("API trả về không thành công");
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Có lỗi xảy ra khi tải dữ liệu";
      setError(errorMessage);
      console.error("Lỗi khi tải dữ liệu home:", err);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []);

  // Auto fetch on mount
  useEffect(() => {
    fetchHome();
  }, [fetchHome]);

  // Utility functions
  const getProductsByCategory = useCallback((categoryId: string) => {
    const category = categories.find(cat => cat._id === categoryId);
    return category?.products || [];
  }, [categories]);

  const getCategoryById = useCallback((categoryId: string) => {
    return categories.find(category => category._id === categoryId);
  }, [categories]);

  const getProductById = useCallback((productId: string) => {
    const allProducts = [
      ...productsFeatured,
      ...productsNew,
      ...categories.flatMap(cat => cat.products || [])
    ];
    return allProducts.find(product => product._id === productId);
  }, [productsFeatured, productsNew, categories]);

  const getArticleById = useCallback((articleId: string) => {
    return articlesFeatured.find(article => article._id === articleId);
  }, [articlesFeatured]);

  // Get all unique products (tránh trùng lặp)
  const getAllProducts = useCallback(() => {
    const allProducts = [
      ...productsFeatured,
      ...productsNew,
      ...categories.flatMap(cat => cat.products || [])
    ];
    
    // Loại bỏ sản phẩm trùng lặp dựa trên _id
    const uniqueProducts = allProducts.filter((product, index, arr) => 
      arr.findIndex(p => p._id === product._id) === index
    );
    
    return uniqueProducts;
  }, [productsFeatured, productsNew, categories]);

  // Retry function
  const retry = useCallback(() => {
    fetchHome();
  }, [fetchHome]);

  return {
    // Main data từ API
    productsFeatured,
    productsNew, 
    categories,
    articlesFeatured,

    // States
    loading,
    error,

    // Actions
    refetch: fetchHome,
    retry,

    // Utilities
    getProductsByCategory,
    getProductById,
    getCategoryById,
    getArticleById,
    getAllProducts,

    // Statistics
    stats: {
      totalFeaturedProducts: productsFeatured.length,
      totalNewProducts: productsNew.length,
      totalCategories: categories.length,
      totalFeaturedArticles: articlesFeatured.length,
      totalUniqueProducts: getAllProducts().length,
      categoriesWithProducts: categories.filter(cat => cat.products && cat.products.length > 0).length,
    }
  };
};

export default HooksHome;