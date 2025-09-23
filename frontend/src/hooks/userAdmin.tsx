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

interface ApiUserData {
    _id: string;
    email: string;
    tokenUser: string;
    status: string;
    deleted: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
    name?: string;
    phone?: string;
}

interface ApiResponse {
    success: boolean;
    count: number;
    data: ApiUserData[] | ApiUserData; 
}

const API_BASE_URL = "http://localhost:3000/api/v1/users";

const apiRequest = async (
    url: string,
    options: RequestInit = {}
): Promise<ApiResponse> => {
    const token = localStorage.getItem('admin_token');
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        headers: headers,
        ...options,
    });
    
    if (response.status === 304) {
        return { success: true, count: 0, data: [] }; // Return empty data for 304 Not Modified
    }
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
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

    // Transform API data to UserClient format
    const transformApiData = (apiData: ApiUserData): UserClient => ({
        id: apiData._id,
        name: apiData.name || apiData.email.split('@')[0], // Use email prefix if no name
        email: apiData.email,
        phone: apiData.phone || '', // Default empty if no phone
        status: apiData.status,
        createdAt: apiData.createdAt,
        updatedAt: apiData.updatedAt
    });

    const fetchUserClients = useCallback(async () => {
        if (loadingRef.current) return;

        loadingRef.current = true;
        setLoading(true);
        setError(null);

        try {
            const result = await apiRequest(API_BASE_URL);
            console.log('API Response:', result); // Debug log
            
            // Handle the new API response structure
            if (result.success && result.data) {
                const apiDataArray = Array.isArray(result.data) ? result.data : [result.data];
                // Transform API data to UserClient format
                const transformedUsers = apiDataArray.map(transformApiData);
                setUserClients(transformedUsers);

                // Update positions
                const newPositions: { [key: string]: number } = {};
                transformedUsers.forEach((userClient, index) => {
                    newPositions[userClient.id] = index + 1;
                });
                setPositions(newPositions);
            } else {
                setUserClients([]);
                setPositions({});
            }
        } catch (error) {
            setError("Failed to fetch user clients");
            console.error('Error fetching users:', error);
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
                userClient.email.toLowerCase().includes(lowerKeyword);
            const matchesStatus = filterStatus ? userClient.status === filterStatus : true;
            return matchesKeyword && matchesStatus;
        });
    }, [userClients, keyword, filterStatus]);

    const getUserClientById = useCallback(async (id: string): Promise<UserClient | null> => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiRequest(`${API_BASE_URL}/detail/${id}`);
            
            if (response.success && response.data) {
                const apiData = Array.isArray(response.data) ? response.data[0] : response.data;
                return apiData ? transformApiData(apiData) : null;
            }
            return null;
        } catch (error) {
            setError("Failed to fetch user client details");
            console.error('Error fetching user by ID:', error);
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
            const response = await apiRequest(`${API_BASE_URL}/edit/${id}`, {
                method: "PATCH",
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

    const updateUserStatus = useCallback(async (id: string, newStatus: string) => {
        try {
            setLoading(true);
            setError(null);
            await apiRequest(`${API_BASE_URL}/edit/${id}`, {
                method: "PATCH",
                body: JSON.stringify({ status: newStatus }),
            });
            await fetchUserClients(); 
            return true;
        } catch (error) {
            setError("Failed to update user status");
            throw error;
        } finally {
            setLoading(false);
        }
    }, [fetchUserClients]);

    const deleteUserClient = useCallback(async (id: string) => {
        try {
            setLoading(true);
            setError(null);
            await apiRequest(`${API_BASE_URL}/deleted/${id}`, {
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

    const clearError = useCallback(() => {
        setError(null);
    }, []);

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
        
        // Computed data
        filterUserClients,
        
        // State setters
        setKeyword,
        setFilterStatus,
        setCurrentPage,
        setItemsPerPage,
        
        // API methods
        fetchUserClients,
        getUserClientById,
        updateUserClient,
        updateUserStatus,
        deleteUserClient,
        
        // Utility
        clearError,
    };
};