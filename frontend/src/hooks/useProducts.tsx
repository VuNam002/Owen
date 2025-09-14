// hooks/useProducts.ts
import { useState, useEffect, useMemo, useCallback } from "react";

type Featured = 0 | 1;
interface Product {
  _id: string;
  position: number;
  title: string;
  thumbnail: string;
  price: number;
  category: string;
  status: string;
  product_category_id: {
    _id: string;
    title: string;
    position: number;
    featured: Featured;
  }
  createdBy: {
    account_id: string;
    name: string;
  };  
  createdAt?: string;
}
interface ApiResponse {
  data: Product[];
  pagination: {
    currentPage: number;
    limitItems: number;
    skip: number;
    totalPages: number;
    totalItems: number;
  };
}

const API_BASE = "http://localhost:3000/api/v1/products";

const apiRequest = async (
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse> => {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [keyword, setKeyword] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("position");
  const [sortOrder, setSortOrder] = useState<string>("asc");
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [positions, setPositions] = useState<{ [key: string]: number }>({});
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);
  const [totalItemsBackend, setTotalItemsBackend] = useState<number>(0);
  const [totalPagesBackend, setTotalPagesBackend] = useState<number>(1);

  // Tạo query string cho API
  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams();
    params.append('page', currentPage.toString());
    params.append('limit', itemsPerPage.toString());
    
    if (filterStatus) {
      params.append('status', filterStatus);
    }
    
    if (keyword.trim()) {
      params.append('keyword', keyword.trim());
    }
    
    if (sortBy) {
      params.append('sortBy', sortBy);
    }
    
    if (sortOrder) {
      params.append('sortOrder', sortOrder);
    }
    
    return params.toString();
  }, [currentPage, itemsPerPage, filterStatus, keyword, sortBy, sortOrder]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryString = buildQueryString();
      const result = await apiRequest(`${API_BASE}?${queryString}`);
      setProducts(result.data);
      setTotalItemsBackend(result.pagination.totalItems);
      setTotalPagesBackend(result.pagination.totalPages);
      
      // Cập nhật positions từ dữ liệu mới
      const initialPositions: { [key: string]: number } = {};
      result.data.forEach((product: Product) => {
        initialPositions[product._id] = product.position;
      });
      setPositions(prevPositions => ({
        ...prevPositions,
        ...initialPositions
      }));
    } catch {
      setError("Không thể tải dữ liệu sản phẩm");
    } finally {
      setLoading(false);
    }
  }, [buildQueryString]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Chỉ sử dụng products trực tiếp từ API (đã được filter và sort ở backend)
  const filteredProducts = useMemo(() => {
    // Nếu backend đã xử lý filter và sort, chỉ cần return products
    // Chỉ cần cập nhật position từ state positions nếu có thay đổi
    return products.map(product => ({
      ...product,
      position: positions[product._id] ?? product.position
    }));
  }, [products, positions]);

  const totalItems = totalItemsBackend;
  const totalPages = totalPagesBackend;
  
  // Sử dụng trực tiếp filteredProducts vì pagination đã được xử lý ở backend
  const paginatedProducts = filteredProducts;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + filteredProducts.length;

  // Reset về trang 1 khi thay đổi filter/search/sort
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
    setSelectedProducts([]);
    setSelectAll(false);
  }, [filterStatus, keyword, sortBy, sortOrder]);

  useEffect(() => {
    const currentPageProductIds = paginatedProducts.map(
      (product) => product._id
    );
    const allCurrentPageSelected = currentPageProductIds.every((id) =>
      selectedProducts.includes(id)
    );
    setSelectAll(allCurrentPageSelected && currentPageProductIds.length > 0);
  }, [paginatedProducts, selectedProducts]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedProducts([]);
    setSelectAll(false);
  };

  const handlePrePage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      setSelectedProducts([]);
      setSelectAll(false);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      setSelectedProducts([]);
      setSelectAll(false);
    }
  };

  const handleSelectProduct = (productId: string, checked: boolean) => {
    setSelectedProducts((prev) =>
      checked ? [...prev, productId] : prev.filter((id) => id !== productId)
    );
    if (!checked) {
      setSelectAll(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      const currentPageIds = paginatedProducts.map((product) => product._id);
      setSelectedProducts((prev) => {
        const newSelected = [...prev];
        currentPageIds.forEach((id) => {
          if (!newSelected.includes(id)) {
            newSelected.push(id);
          }
        });
        return newSelected;
      });
    } else {
      const currentPageIds = paginatedProducts.map((product) => product._id);
      setSelectedProducts((prev) =>
        prev.filter((id) => !currentPageIds.includes(id))
      );
    }
  };

  const handleStatusChange = async (
    productId: string,
    currentStatus: string
  ) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      await apiRequest(`${API_BASE}/change-status/${newStatus}/${productId}`, {
        method: "PATCH",
      });
      // Refresh dữ liệu để đảm bảo đồng bộ
      await fetchProducts();
    } catch {
      setError("Không thể thay đổi trạng thái sản phẩm");
    }
  };

  const handlePositionChange = (productId: string, newPosition: number) => {
    setPositions((prev) => ({ ...prev, [productId]: newPosition }));
  };

  const handleSavePosition = async () => {
    try {
      await apiRequest(`${API_BASE}/change-position`, {
        method: "PATCH",
        body: JSON.stringify(positions),
      });
      // Refresh dữ liệu sau khi lưu position
      await fetchProducts();
    } catch {
      setError("Không thể lưu vị trí sản phẩm");
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;

    try {
      await apiRequest(`${API_BASE}/delete/${productId}`, {
        method: "DELETE",
      });
      setSelectedProducts((prev) => prev.filter((id) => id !== productId));
      // Refresh dữ liệu sau khi xóa
      await fetchProducts();
    } catch {
      setError("Không thể xóa sản phẩm");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;
    if (
      !confirm(
        `Bạn có chắc chắn muốn xóa ${selectedProducts.length} sản phẩm đã chọn?`
      )
    )
      return;

    try {
      for (const productId of selectedProducts) {
        await apiRequest(`${API_BASE}/delete/${productId}`, {
          method: "DELETE",
        });
      }
      setSelectedProducts([]);
      setSelectAll(false);
      // Refresh dữ liệu sau khi xóa bulk
      await fetchProducts();
    } catch {
      setError("Không thể xóa các sản phẩm đã chọn");
    }
  };

  const handleEditProduct = useCallback(async(productId: string, productData: Partial<Product>): Promise<boolean> => {
    if(loading) return false;
    setLoading(true);
    setError(null);
    try {
      await apiRequest(`${API_BASE}/edit/${productId}`, {
        method: "PATCH",
        body: JSON.stringify(productData),
      });
      await fetchProducts();
      return true;
    } catch {
      setError("Không thể cập nhật sản phẩm");
      return false;
    } finally {
      setLoading(false);
    }
  }, [loading, fetchProducts]);

  return {
    loading,
    error,
    setError,
    paginatedProducts,
    totalItems,
    totalPages,
    currentPage,
    startIndex,
    endIndex,
    keyword,
    setKeyword,
    filterStatus,
    setFilterStatus,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    selectedProducts,
    selectAll,
    handleSelectProduct,
    handleSelectAll,
    handlePageChange,
    handlePrePage,
    handleNextPage,
    handleStatusChange,
    handlePositionChange, 
    handleSavePosition,
    handleDeleteProduct,
    handleBulkDelete,
    positions, 
    handleEditProduct
  };
};