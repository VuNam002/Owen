import { useEffect, useMemo, useState, useCallback, useRef } from "react";

interface Account {
    _id: string;
    fullName: string;
    email: string;
    password: string;
    token: string;
    phone: string;
    status: string;
}

interface ApiResponse {
    data: Account[];
}

const API_BASE = "http://localhost:3000/api/v1/accounts";

// Memoize API request function
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

export const useAccount = () => {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [keyword, setKeyword] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage, setItemsPerPage] = useState<number>(10);
    const [positions, setPositions] = useState<{ [key: string]: number }>({});
    
    // Use ref to prevent unnecessary re-renders
    const loadingRef = useRef(false);

    const fetchAccounts = useCallback(async () => {
        if (loadingRef.current) return; // Prevent concurrent requests
        
        loadingRef.current = true;
        setLoading(true);
        setError(null);
        
        try {
            const result = await apiRequest(API_BASE);
            setAccounts(result.data);
            
            // Optimize positions calculation
            const newPositions: { [key: string]: number } = {};
            result.data.forEach((account, index) => {
                newPositions[account._id] = index + 1;
            });
            setPositions(newPositions);
        } catch (err) {
            setError("Không thể tải dữ liệu tài khoản");
            console.error("Fetch accounts error:", err);
        } finally {
            setLoading(false);
            loadingRef.current = false;
        }
    }, []);

    useEffect(() => {
        fetchAccounts();
    }, [fetchAccounts]);

    // Memoize filtered accounts with dependency optimization
    const filterAccounts = useMemo(() => {
        if (!accounts.length) return [];
        
        const keywordLower = keyword.toLowerCase();
        const hasKeyword = keyword.trim().length > 0;
        const hasStatusFilter = filterStatus.length > 0;
        
        if (!hasKeyword && !hasStatusFilter) return accounts;
        
        return accounts.filter((account: Account) => {
            // Status filter check
            if (hasStatusFilter && account.status !== filterStatus) {
                return false;
            }
            
            // Keyword search check
            if (hasKeyword) {
                return (
                    account.fullName.toLowerCase().includes(keywordLower) ||
                    account.email.toLowerCase().includes(keywordLower) ||
                    account.phone.includes(keyword)
                );
            }
            
            return true;
        });
    }, [accounts, filterStatus, keyword]);

    const createAccount = useCallback(async (accountData: Omit<Account, "_id">): Promise<boolean> => {
        if (loadingRef.current) return false;
        
        loadingRef.current = true;
        setLoading(true);
        setError(null);
        
        try {
            await apiRequest(`${API_BASE}/create`, {
                method: "POST",
                body: JSON.stringify(accountData),
            });
            await fetchAccounts();
            return true;
        } catch (err) {
            setError("Không thể tạo tài khoản");
            console.error("Create account error:", err);
            return false;
        } finally {
            setLoading(false);
            loadingRef.current = false;
        }
    }, [fetchAccounts]);

    const updateAccount = useCallback(async (id: string, accountData: Partial<Account>): Promise<boolean> => {
        if (loadingRef.current) return false;
        
        loadingRef.current = true;
        setLoading(true);
        setError(null);
        
        try {
            await apiRequest(`${API_BASE}/edit/${id}`, {
                method: "PATCH",
                body: JSON.stringify(accountData),
            });
            await fetchAccounts();
            return true;
        } catch (err) {
            setError("Không thể cập nhật tài khoản");
            console.error("Update account error:", err);
            return false;
        } finally {
            setLoading(false);
            loadingRef.current = false;
        }
    }, [fetchAccounts]);

    const handleStatusChange = useCallback(async (
        id: string,
        currentStatus: string
    ) => {
        const newStatus = currentStatus === "active" ? "inactive" : "active";
        
        try {
            await apiRequest(`${API_BASE}/change-status/${newStatus}/${id}`, {
                method: "PATCH",
            });
            
            setAccounts(prev => 
                prev.map(account => 
                    account._id === id 
                        ? { ...account, status: newStatus } 
                        : account
                )
            );
        } catch (err) {
            setError("Không thể cập nhật trạng thái tài khoản");
            console.error("Status change error:", err);
            fetchAccounts();
        }
    }, [fetchAccounts]);

    const deleteAccount = useCallback(async (id: string) => {
        if (loadingRef.current) return;
        
        loadingRef.current = true;
        setLoading(true);
        setError(null);
        
        try {
            await apiRequest(`${API_BASE}/deleted/${id}`, {
                method: "DELETE",
            });
            await fetchAccounts();
        } catch (err) {
            setError("Không thể xóa tài khoản");
            console.error("Delete account error:", err);
        } finally {
            setLoading(false);
            loadingRef.current = false;
        }
    }, [fetchAccounts]);

    const getAccountById = useCallback(async (id: string): Promise<Account | undefined> => {
        if (loadingRef.current) return undefined;
        
        loadingRef.current = true;
        setLoading(true);
        setError(null);
        
        try {
            const result = await apiRequest(`${API_BASE}/${id}`);
            return result as unknown as Account; 
        } catch (err) {
            setError("Không thể tải thông tin tài khoản");
            console.error("Get account by ID error:", err);
            return undefined;
        } finally {
            setLoading(false);
            loadingRef.current = false;
        }
    }, []);

    const resetFilters = useCallback(() => {
        setKeyword("");
        setFilterStatus("");
        setCurrentPage(1);
    }, []);

    // Memoize pagination calculations
    const paginationData = useMemo(() => {
        const totalPages = Math.ceil(filterAccounts.length / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const paginatedAccounts = filterAccounts.slice(
            startIndex,
            startIndex + itemsPerPage
        );
        
        return { totalPages, paginatedAccounts };
    }, [filterAccounts, currentPage, itemsPerPage]);

    // Memoize error setter to prevent unnecessary re-renders
    const clearError = useCallback(() => setError(null), []);

    return {
        accounts: paginationData.paginatedAccounts,
        allAccounts: accounts,
        filteredAccounts: filterAccounts,
        loading,
        error,
        keyword,
        currentPage,
        itemsPerPage,
        totalPages: paginationData.totalPages,
        positions,
        createAccount,
        updateAccount,
        deleteAccount,
        fetchAccounts,
        getAccountById,
        resetFilters,
        handleStatusChange,
        filterStatus,
        setFilterStatus,
        setKeyword,
        setCurrentPage,
        setItemsPerPage,
        setError: clearError,
    };
};