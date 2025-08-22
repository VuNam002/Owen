import { useEffect, useState, useMemo } from "react";

interface Category {
    _id: string;
    title: string;
    parent_id: string;
    status: string;
    position: number;
    thumbnail: string;
    createdBy: {
      _id: string;
      name: string;
    };
    createdAt?: string;
}
interface ApiResponse {
    data: Category[];
}

const API_BASE = "http://localhost:3000/api/v1/categorys";
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

export const useCategorys = () => {
    const [categorys, setCategorys] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [keyword, setKeyword] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [sortBy, setSortBy] = useState("position");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [selectedCategorys, setSelectedCategorys] = useState<string[]>([]);
    const [selectAll, setSelectAll] = useState(false);
    const [positions, setPositions] = useState<{ [key: string]: number }>({});

    const fetchCategorys = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await apiRequest(API_BASE);
            setCategorys(result.data);
            const initialPositions: { [key: string]: number } = {};
            result.data.forEach((category: Category) => {
                initialPositions[category._id] = category.position;
            });
            setPositions(initialPositions);
        } catch {
            setError("Không thể tải dữ liệu danh mục");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategorys();
    }, []);

    const filteredCategorys = useMemo(() => {
        return categorys
            .filter((category: Category) => {
                const matchesStatus = !filterStatus || category.status === filterStatus;
                const matchesKeyword = !keyword || category.title.toLowerCase().includes(keyword.toLowerCase());
                return matchesStatus && matchesKeyword;
            })
            .sort((a: Category, b: Category) => {
                const getValue = (category: Category, field: string) => {
                    switch (field) {
                        case "title":
                            return category.title.toLowerCase();
                        case "position":
                            return positions[category._id] ?? category.position;
                        case "createdAt":
                            return new Date(category.createdAt || "").getTime();
                        default:
                            return positions[category._id] ?? category.position;
                    }
                };
                const aValue = getValue(a, sortBy);
                const bValue = getValue(b, sortBy);
                if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
                if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
                return 0;
            });
    }, [categorys, filterStatus, keyword, sortBy, sortOrder, positions]);

    // Pagination
    const paginatedCategorys = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredCategorys.slice(start, start + itemsPerPage);
    }, [filteredCategorys, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredCategorys.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage + 1;
    const endIndex = Math.min(currentPage * itemsPerPage, filteredCategorys.length);

    // Select all logic
    useEffect(() => {
        if (selectAll) {
            setSelectedCategorys(filteredCategorys.map(cat => cat._id));
        } else {
            setSelectedCategorys([]);
        }
    }, [selectAll, filteredCategorys]);

    // Các hàm xử lý
    const handleSelectCategory = (id: string) => {
        if (selectedCategorys.includes(id)) {
            setSelectedCategorys(selectedCategorys.filter(_id => _id !== id));
        } else {
            setSelectedCategorys([...selectedCategorys, id]);
        }
    };

    const handleStatusChange = async (
        id: string,
        currentStatus: string
    ) => {
        const newStatus = currentStatus === "active" ? "inactive" : "active";
        try {
            await apiRequest(`${API_BASE}/change-status/${newStatus}/${id}`, {
                method: "PATCH",
            });
            setCategorys(prev => prev.map(category => category._id === id ? { ...category, status: newStatus } : category));
        } catch {
            setError("Không thể thay đổi trạng thái danh mục");
        }
    }

    const handleBulkDelete = async () => {
        if (selectedCategorys.length === 0) return;
        if (
            !confirm(`Bạn có chắc chắn muốn xóa ${selectedCategorys.length} danh mục đã chọn?`)
        )
            return;
        try {
            // Gọi API xóa nhiều (nếu backend hỗ trợ bulk delete)
            await apiRequest(`${API_BASE}/delete`, {
                method: "POST",
                body: JSON.stringify({ ids: selectedCategorys }),
            });
            // Cập nhật lại danh sách
            fetchCategorys();
            setSelectedCategorys([]);
            setSelectAll(false);
        } catch {
            setError("Không thể xóa các danh mục đã chọn");
        }
    }

    const handleDelete = async (id: string) => {
        try {
            await apiRequest(`${API_BASE}/delete/${id}`, {
                method: "DELETE",
            });
            fetchCategorys(); // cập nhật lại danh sách
        } catch {
            setError("Xóa không thành công");
        }
    };

    const handleSelectAll = () => {
        setSelectAll(!selectAll);
    };

    const handlePageChange = (page: number) => setCurrentPage(page);
    const handlePrePage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
    const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));


    return {
        categorys, // toàn bộ danh sách
        paginatedCategorys, // danh sách phân trang
        loading,
        error,
        keyword,
        setKeyword,
        filterStatus,
        setFilterStatus,
        sortBy,
        setSortBy,
        sortOrder,
        setSortOrder,
        currentPage,
        setCurrentPage,
        itemsPerPage,
        selectedCategorys,
        setSelectedCategorys,
        selectAll,
        setSelectAll,
        positions,
        setPositions,
        totalItems: filteredCategorys.length,
        totalPages,
        startIndex,
        endIndex,
        handleSelectCategory,
        handleSelectAll,
        handlePageChange,
        handlePrePage,
        handleNextPage,
        handleStatusChange,
        handleBulkDelete,
        handleDelete
    };
}