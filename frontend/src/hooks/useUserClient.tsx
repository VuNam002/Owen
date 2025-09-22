import { useState, useCallback, useRef, useMemo } from "react";

interface UserClient {
    id: string;
    name: string;
    email: string;
    phone: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

interface ApiResponse {
    data: UserClient[];
}

const API_BASE_URL = "http://localhost:3000/api/v1/users";

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

export const useUserClient = () => {
    const [userClients, setUserClients] = useState<UserClient[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [keyword, setKeyword] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage, setItemsPerPage] = useState<number>(10);
    const [positions, setPositions] = useState<{ [key: string]: number }>({});

    const loadingRef = useRef(false);

    const fetchUserClients = useCallback(async () => {
        if (loadingRef.current) return;

        loadingRef.current = true;
        setLoading(true);
        setError(null);

        try {
            const result = await apiRequest(API_BASE_URL);
            setUserClients(result.data);

            const newPositions: { [key: string]: number } = {};
            result.data.forEach((userClient, index) => {
                newPositions[userClient.id] = index + 1;
            });
            setPositions(newPositions);
        } catch  {
            setError("Failed to fetch user clients");
        } finally {
            loadingRef.current = false;
            setLoading(false);
        }
    }, []);

    const filterUserClients = useMemo(() => {
        if (!userClients.length) return [];

        const lowerKeyword = keyword.toLowerCase();
        return userClients.filter((userClient) => {
            const matchesKeyword =
                userClient.name.toLowerCase().includes(lowerKeyword) ||
                userClient.email.toLowerCase().includes(lowerKeyword) ||
                userClient.phone.toLowerCase().includes(lowerKeyword);
            const matchesStatus = filterStatus ? userClient.status === filterStatus : true;
            return matchesKeyword && matchesStatus;
        });
    }, [userClients, keyword, filterStatus]);

    const createUserClient = useCallback(async (newUserClient: Omit<UserClient, 'id'>) => {
        try {
            const response = await apiRequest(API_BASE_URL, {
                method: "POST",
                body: JSON.stringify(newUserClient),
            });
            await fetchUserClients();
            return response.data;
        } catch (error) {
            setError("Failed to create user client");
            throw error;
        }
    }, [fetchUserClients]);

    const getUserClientById = useCallback(async (id: string): Promise<UserClient | null> => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiRequest(`${API_BASE_URL}/${id}`);
            return response.data[0] || null;
        } catch  {
            setError("Failed to fetch user client details" );
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateUserClient = useCallback(async (
        id: string, 
        updatedUserClient: Partial<Omit<UserClient, 'id' | 'createdAt'>>
    ) => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiRequest(`${API_BASE_URL}/${id}`, {
                method: "PUT",
                body: JSON.stringify(updatedUserClient),
            });
            await fetchUserClients(); 
            return response.data;
        } catch (error) {
            setError("Failed to update user client");
            throw error;
        } finally {
            setLoading(false);
        }
    }, [fetchUserClients]);
    const deleteUserClient = useCallback(async (id: string) => {
        try {
            setLoading(true);
            setError(null);
            await apiRequest(`${API_BASE_URL}/${id}`, {
                method: "DELETE",
            });
            await fetchUserClients(); 
            return true;
        } catch (error) {
            setError("Failed to delete user client");
            throw error;
        } finally {
            setLoading(false);
        }
    }, [fetchUserClients]);

    // Chức năng xóa nhiều người dùng
    const deleteMultipleUserClients = useCallback(async (ids: string[]) => {
        try {
            setLoading(true);
            setError(null);
            await Promise.all(
                ids.map(id => apiRequest(`${API_BASE_URL}/${id}`, {
                    method: "DELETE",
                }))
            );
            
            await fetchUserClients(); 
            return true;
        } catch (error) {
            setError("Failed to delete multiple user clients");
            throw error;
        } finally {
            setLoading(false);
        }
    }, [fetchUserClients]);

    return {
        // State
        userClients,
        loading,
        error,
        keyword,
        filterStatus,
        currentPage,
        itemsPerPage,
        positions,
        
        filterUserClients,
        
        setKeyword,
        setFilterStatus,
        setCurrentPage,
        setItemsPerPage,
        fetchUserClients,
        createUserClient,
        getUserClientById,
        updateUserClient,
        deleteUserClient,
        deleteMultipleUserClients,
        
        // Utility
        clearError: () => setError(null),
    };
};