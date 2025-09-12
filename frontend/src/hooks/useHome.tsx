import { useState, useEffect, useRef, useCallback } from "react";

type Featured = "0" | "1";

export interface Product {
  _id: string;
  title: string;
  thumbnail: string;
  price: number;
  discountPercentage?: number;
  priceNew?: number;
  status: string;
  featured: Featured;
  product_category_id: string | { _id: string; title: string }; // Populated khi cần
  position: number;
  deleted: boolean;
  brand?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  _id: string;
  title: string;
  slug?: string;
  thumbnail?: string;
  description?: string;
  status: string;
  deleted: boolean;
  parent_id: string;
  position?: number;
  products?: Product[];
}

export interface Article {
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
  message?: string;
}

interface BrandApiResponse {
  success: boolean;
  data: Product[];
  pagination?: {
    currentPage: number;
    limitItems: number;
    skip: number;
    totalPage: number;
  };
  brand: string;
  totalProducts: number;
  message?: string;
}

interface BrandsApiResponse {
  success: boolean;
  data: {
    brands: string[];
    brandCounts: { _id: string; count: number }[];
  };
  totalBrands: number;
  message?: string;
}

// Interface mới cho Category Products API
interface CategoryApiResponse {
  success: boolean;
  data: Product[];
  pagination?: {
    currentPage: number;
    limitItems: number;
    skip: number;
    totalPage: number;
  };
  category: {
    _id: string;
    title: string;
    slug?: string;
  };
  brandsInCategory: string[];
  totalProducts: number;
  message?: string;
}

interface SortOptions {
  sort_key?: string;
  sort_value?: 'asc' | 'desc';
}

interface BrandFilterOptions {
  keyword?: string;
  limit?: number;
  page?: number;
  sort_key?: string;
  sort_value?: 'asc' | 'desc';
}

// Interface mới cho Category Filter Options
interface CategoryFilterOptions {
  keyword?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  page?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const API_BASE = "http://localhost:3000/api/v1/home";

const apiRequest = async <T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
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
  const [favorites, setFavorites] = useState<string[]>([]);
  
  // Brand related states
  const [brands, setBrands] = useState<string[]>([]);
  const [brandCounts, setBrandCounts] = useState<{ _id: string; count: number }[]>([]);
  const [brandProducts, setBrandProducts] = useState<Product[]>([]);
  const [brandPagination, setBrandPagination] = useState<any>(null);
  const [currentBrand, setCurrentBrand] = useState<string>("");

  // Category related states - THÊM MỚI
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
  const [categoryPagination, setCategoryPagination] = useState<any>(null);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [brandsInCategory, setBrandsInCategory] = useState<string[]>([]);

  const loadingRef = useRef(false);

  const toggleFavorite = (productId: string) => {
    setFavorites((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const fetchHome = useCallback(async () => {
    if (loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const result = await apiRequest<HomeApiResponse>(API_BASE);

      if (result.success) {
        setProductsFeatured(result.data.productsFeatured || []);
        setProductsNew(result.data.productsNew || []);
        setCategories(result.data.categories || []);
        setArticlesFeatured(result.data.articlesFeatured || []);
      } else {
        throw new Error("API trả về không thành công");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Có lỗi xảy ra khi tải dữ liệu";
      setError(errorMessage);
      console.error("Lỗi khi tải dữ liệu home:", err);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []);

  // Fetch all brands
  const fetchAllBrands = useCallback(async (): Promise<boolean> => {
    if (loadingRef.current) return false;
    
    loadingRef.current = true;
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiRequest<BrandsApiResponse>(`${API_BASE}/brands`);
      
      if (result.success) {
        setBrands(result.data.brands || []);
        setBrandCounts(result.data.brandCounts || []);
        return true;
      } else {
        throw new Error("Lỗi khi tải danh sách brands");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Có lỗi xảy ra khi tải brands";
      setError(errorMessage);
      console.error("Lỗi khi tải brands:", err);
      return false;
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []);

  // Get products by brand
  const getBrandProducts = useCallback(async (
    brandName: string, 
    options: BrandFilterOptions = {}
  ): Promise<boolean> => {
    if (loadingRef.current) return false;
    
    loadingRef.current = true;
    setLoading(true);
    setError(null);
    
    try {
      // Build query params
      const queryParams = new URLSearchParams();
      
      if (options.keyword) queryParams.append('keyword', options.keyword);
      if (options.limit) queryParams.append('limit', options.limit.toString());
      if (options.page) queryParams.append('page', options.page.toString());
      if (options.sort_key) queryParams.append('sort_key', options.sort_key);
      if (options.sort_value) queryParams.append('sort_value', options.sort_value);

      const queryString = queryParams.toString();
      const url = `${API_BASE}/brand/${brandName}${queryString ? `?${queryString}` : ''}`;
      
      const result = await apiRequest<BrandApiResponse>(url);
      
      if (result.success) {
        setBrandProducts(result.data || []);
        setBrandPagination(result.pagination || null);
        setCurrentBrand(result.brand || brandName);
        return true;
      } else {
        throw new Error("Lỗi khi tải sản phẩm theo brand");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Có lỗi xảy ra khi tải sản phẩm theo brand";
      setError(errorMessage);
      console.error("Lỗi khi tải sản phẩm theo brand:", err);
      return false;
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []);

  // Get products by category - HÀM MỚI
  const getCategoryProducts = useCallback(async (
    categoryId: string, 
    options: CategoryFilterOptions = {}
  ): Promise<boolean> => {
    if (loadingRef.current) return false;
    
    loadingRef.current = true;
    setLoading(true);
    setError(null);
    
    try {
      // Build query params
      const queryParams = new URLSearchParams();
      
      if (options.keyword) queryParams.append('keyword', options.keyword);
      if (options.brand) queryParams.append('brand', options.brand);
      if (options.minPrice) queryParams.append('minPrice', options.minPrice.toString());
      if (options.maxPrice) queryParams.append('maxPrice', options.maxPrice.toString());
      if (options.limit) queryParams.append('limit', options.limit.toString());
      if (options.page) queryParams.append('page', options.page.toString());
      if (options.sortBy) queryParams.append('sortBy', options.sortBy);
      if (options.sortOrder) queryParams.append('sortOrder', options.sortOrder);

      const queryString = queryParams.toString();
      const url = `${API_BASE}/category/${categoryId}${queryString ? `?${queryString}` : ''}`;
      
      const result = await apiRequest<CategoryApiResponse>(url);
      
      if (result.success) {
        setCategoryProducts(result.data || []);
        setCategoryPagination(result.pagination || null);
        setCurrentCategory(result.category || null);
        setBrandsInCategory(result.brandsInCategory || []);
        return true;
      } else {
        throw new Error("Lỗi khi tải sản phẩm theo danh mục");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Có lỗi xảy ra khi tải sản phẩm theo danh mục";
      setError(errorMessage);
      console.error("Lỗi khi tải sản phẩm theo danh mục:", err);
      return false;
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
  const getProductsByCategory = useCallback(
    (categoryId: string) => {
      const category = categories.find((cat) => cat._id === categoryId);
      return category?.products || [];
    },
    [categories]
  );

  const getCategoryById = useCallback(
    (categoryId: string) => {
      return categories.find((category) => category._id === categoryId);
    },
    [categories]
  );

  const getProductById = useCallback(
    (productId: string) => {
      const allProducts = [
        ...productsFeatured,
        ...productsNew,
        ...brandProducts,
        ...categoryProducts, // THÊM MỚI
        ...categories.flatMap((cat) => cat.products || []),
      ];
      return allProducts.find((product) => product._id === productId);
    },
    [productsFeatured, productsNew, brandProducts, categoryProducts, categories]
  );

  const calculateSavings = (originalPrice: number, discountPercentage: number): number => {
    if (!discountPercentage || discountPercentage <= 0) return 0;
    return (originalPrice * discountPercentage) / 100;
  };

  const getArticleById = useCallback(
    (articleId: string) => {
      return articlesFeatured.find((article) => article._id === articleId);
    },
    [articlesFeatured]
  );

  // Get all unique products (tránh trùng lặp)
  const getAllProducts = useCallback(() => {
    const allProducts = [
      ...productsFeatured,
      ...productsNew,
      ...brandProducts,
      ...categoryProducts, // THÊM MỚI
      ...categories.flatMap((cat) => cat.products || []),
    ];

    // Loại bỏ sản phẩm trùng lặp dựa trên _id
    const uniqueProducts = allProducts.filter(
      (product, index, arr) =>
        arr.findIndex((p) => p._id === product._id) === index
    );

    return uniqueProducts;
  }, [productsFeatured, productsNew, brandProducts, categoryProducts, categories]);

  // Get brand count by name
  const getBrandCount = useCallback((brandName: string): number => {
    const brandData = brandCounts.find(item => item._id === brandName);
    return brandData ? brandData.count : 0;
  }, [brandCounts]);

  // Clear brand data
  const clearBrandData = useCallback(() => {
    setBrandProducts([]);
    setBrandPagination(null);
    setCurrentBrand("");
  }, []);

  // Clear category data - HÀM MỚI
  const clearCategoryData = useCallback(() => {
    setCategoryProducts([]);
    setCategoryPagination(null);
    setCurrentCategory(null);
    setBrandsInCategory([]);
  }, []);

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

    // Brand data
    brands,
    brandCounts,
    brandProducts,
    brandPagination,
    currentBrand,

    // Category data - THÊM MỚI
    categoryProducts,
    categoryPagination,
    currentCategory,
    brandsInCategory,

    // States
    loading,
    error,

    // Actions
    refetch: fetchHome,
    retry,
    fetchAllBrands,
    getBrandProducts,
    getCategoryProducts, // THÊM MỚI
    clearBrandData,
    clearCategoryData, // THÊM MỚI

    // Utilities
    getProductsByCategory,
    getProductById,
    getCategoryById,
    getArticleById,
    getAllProducts,
    getBrandCount,
    toggleFavorite,
    calculateSavings,

    // Favorites
    favorites,

    // Statistics
    stats: {
      totalFeaturedProducts: productsFeatured.length,
      totalNewProducts: productsNew.length,
      totalCategories: categories.length,
      totalFeaturedArticles: articlesFeatured.length,
      totalUniqueProducts: getAllProducts().length,
      totalBrands: brands.length,
      totalBrandProducts: brandProducts.length,
      totalCategoryProducts: categoryProducts.length, // THÊM MỚI
      categoriesWithProducts: categories.filter(
        (cat) => cat.products && cat.products.length > 0
      ).length,
    },
  };
};

export default HooksHome