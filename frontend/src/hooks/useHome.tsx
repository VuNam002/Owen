import { useState, useEffect, useRef, useCallback } from "react";

type Featured = 0 | 1;

interface Product {
  _id: string;
  position: number;
  title: string;
  thumbnail: string;
  price: number;
  status: string;
  featured: Featured;
  categoryId?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Category {
  _id: string;
  title: string;
  status: string;
  thumbnail?: string;
  description?: string;
}

interface ApiResponse {
  data: {
    products: Product[];
    categories: Category[];
  };
}

const API_BASE = "http://localhost:3000/api/v1/home";

const apiRequest = async (
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse> => {
  const response = await fetch(url, {
    headers: { "Content-type": "application/json" },
    ...options,
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

export const useHome = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
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
      setProducts(result.data.products);
      setCategories(result.data.categories);

      // Update positions if needed
      const newPositions: { [key: string]: number } = {};
      result.data.products.forEach((product, index) => {
        newPositions[product._id] = index + 1;
      });

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

  // Computed values
  const featuredProducts = products.filter(product => product.featured === 1 && product.status === 'active');
  
  const activeProducts = products.filter(product => product.status === 'active');
  
  const newProducts = products
    .filter(product => product.status === 'active' && product.createdAt)
    .sort((a, b) => {
      if (!a.createdAt || !b.createdAt) return 0;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .slice(0, 8); // Lấy 8 sản phẩm mới nhất

  const activeCategories = categories.filter(category => category.status === 'active');

  const getProductsByCategory = useCallback((categoryId: string) => {
    return activeProducts.filter(product => product.categoryId === categoryId);
  }, [activeProducts]);

  const getProductById = useCallback((productId: string) => {
    return products.find(product => product._id === productId);
  }, [products]);

  const getCategoryById = useCallback((categoryId: string) => {
    return categories.find(category => category._id === categoryId);
  }, [categories]);

  // Retry function
  const retry = useCallback(() => {
    fetchHome();
  }, [fetchHome]);

  return {
    // Data
    products: activeProducts,
    categories: activeCategories,
    featuredProducts,
    newProducts,
    allProducts: products, // Tất cả sản phẩm (bao gồm inactive)
    allCategories: categories, // Tất cả danh mục (bao gồm inactive)

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

    // Statistics
    stats: {
      totalProducts: products.length,
      activeProducts: activeProducts.length,
      featuredProducts: featuredProducts.length,
      totalCategories: categories.length,
      activeCategories: activeCategories.length,
    }
  };
};