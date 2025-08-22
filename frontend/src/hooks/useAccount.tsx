import { useEffect, useMemo, useState, useCallback } from "react";

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

    const fetchAccounts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await apiRequest(API_BASE);
            setAccounts(result.data);
            const positions: { [key: string]: number } = {};
            result.data.forEach((account, index) => {
                positions[account._id] = index + 1;
            });
            setPositions(positions);
        } catch {
            setError("Không thể tải dữ liệu tài khoản");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAccounts();
    }, [fetchAccounts]);

    const filterAccounts = useMemo(() => {
        return accounts
            .filter((account: Account) => {
                if (filterStatus && account.status !== filterStatus) {
                    return false;
                }
                if (keyword) {
                    const searchLower = keyword.toLowerCase();
                    return (
                        account.fullName.toLowerCase().includes(searchLower) ||
                        account.email.toLowerCase().includes(searchLower) ||
                        account.phone.includes(keyword)
                    );
                }
                return true;
            });
    }, [accounts, filterStatus, keyword]);

    const createAccount = async (accountData: Omit<Account, "_id">): Promise<boolean> => {
        setLoading(true);
        setError(null);
        try {
            await apiRequest(`${API_BASE}/create`, {
                method: "POST",
                body: JSON.stringify(accountData),
            });
            await fetchAccounts();
            return true;
        } catch  {
            setError("Không thể tạo tài khoản");
            return false;
        } finally {
            setLoading(false);
        }
    };

    const updateAccount = async (id: string, accountData: Partial<Account>): Promise<boolean> => {
        setLoading(true);
        setError(null);
        try {
            await apiRequest(`${API_BASE}/edit/${id}`, {
                method: "PATCH",
                body: JSON.stringify(accountData),
            });
            await fetchAccounts();
            return true;
        } catch  {
            setError( "Không thể cập nhật tài khoản");
            return false;
        } finally {
            setLoading(false);
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
            setAccounts(prev => 
                prev.map(account => 
                    account._id === id 
                        ? { ...account, status: newStatus } 
                        : account
                )
            );
        } catch {
            setError("Không thể cập nhật trạng thái tài khoản");
        }
    };

    const deleteAccount = async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            await apiRequest(`${API_BASE}/deleted/${id}`, {
                method: "DELETE",
            });
            await fetchAccounts();
        } catch {
            setError("Không thể xóa tài khoản");
        } finally {
            setLoading(false);
        }
    };

    const totalPages = Math.ceil(filterAccounts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedAccounts = filterAccounts.slice(
        startIndex,
        startIndex + itemsPerPage
    );

    const getAccountById = useCallback((id: string): Account | undefined => {
        return accounts.find(account => account._id === id);
    }, [accounts]);

    const resetFilters = () => {
        setKeyword("");
        setFilterStatus("");
        setCurrentPage(1);
    };

    return {
        accounts: paginatedAccounts,
        allAccounts: accounts,
        filteredAccounts: filterAccounts,
        loading,
        error,
        keyword,
        currentPage,
        itemsPerPage,
        totalPages,
        positions,
        createAccount,
        updateAccount, // Export updateAccount
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
        setError,
    };
};