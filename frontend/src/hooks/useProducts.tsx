// hooks/useProducts.ts
import { useState, useEffect, useMemo } from "react";

interface Product {
  _id: string;
  position: number;
  title: string;
  thumbnail: string;
  price: number;
  category: string;
  status: string;
  createdBy: {
    _id: string;
    name: string;
  };  
  createdAt?: string;
}
interface ApiResponse {
  data: Product[];
  // Có thể thêm các thuộc tính khác như metadata, pagination...
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

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiRequest(API_BASE);
      setProducts(result.data);
      const initialPositions: { [key: string]: number } = {};
      result.data.forEach((product: Product) => {
        initialPositions[product._id] = product.position;
      });
      setPositions(initialPositions);
    } catch {
      setError("Không thể tải dữ liệu sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products
      .filter((product: Product) => {
        const matchesStatus = !filterStatus || product.status === filterStatus;
        const matchesKeyword =
          !keyword ||
          product.title.toLowerCase().includes(keyword.toLowerCase());
        return matchesStatus && matchesKeyword;
      })
      .sort((a: Product, b: Product) => {
        const getValue = (product: Product, field: string) => {
          switch (field) {
            case "title":
              return product.title.toLowerCase();
            case "price":
              return product.price;
            case "position":
              return positions[product._id] ?? product.position;
            case "createdAt":
              return new Date(product.createdAt || "");
            default:
              return positions[product._id] ?? product.position;
          }
        };

        const aValue = getValue(a, sortBy);
        const bValue = getValue(b, sortBy);

        if (sortOrder === "asc") {
          return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        } else {
          return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
        }
      });
  }, [products, filterStatus, keyword, sortBy, sortOrder, positions]);

  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
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
      setProducts((prev) =>
        prev.map((product) =>
          product._id === productId
            ? { ...product, status: newStatus }
            : product
        )
      );
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
      setProducts((prev) =>
        prev.map((product) => ({
          ...product,
          position: positions[product._id] || product.position,
        }))
      );
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
      setProducts((prev) =>
        prev.filter((product) => product._id !== productId)
      );
      setSelectedProducts((prev) => prev.filter((id) => id !== productId));
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
      setProducts((prev) =>
        prev.filter((product) => !selectedProducts.includes(product._id))
      );
      setSelectedProducts([]);
      setSelectAll(false);
    } catch {
      setError("Không thể xóa các sản phẩm đã chọn");
    }
  };

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
  };
};
