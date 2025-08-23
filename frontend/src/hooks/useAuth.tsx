import { useEffect, useMemo, useState, useCallback } from "react";

interface Auth {
    token: string;
    user: {
        _id: string;
        fullName: string;
        email: string;
        phone: string;
        status: string;
        role: string;
    }
}

interface ApiResponse {
    data: Auth[];
}

interface LoginResponse {
    data: {
        token: string;
        user: {
            _id: string;
            fullName: string;
            email: string;
            phone: string;
            status: string;
            role: string;
        }
    }
}

const API_BASE = "http://localhost:3000/api/v1/auth";

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
}

export const useAuth = () => {
    const [auth, setAuth] = useState<Auth | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Khởi tạo auth từ localStorage khi component mount
    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    await fetchUserProfile(token);
                } catch (err) {
                    localStorage.removeItem('token');
                    console.error('Token invalid:', err);
                }
            }
        };
        
        initAuth();
    }, []);

    const fetchUserProfile = useCallback(async (token: string) => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE}/profile`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user profile');
            }

            const data = await response.json();
            setAuth({
                token,
                user: data.data
            });
        } catch (err) {
            console.error('Error fetching user profile:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchAccounts = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No token found');

            await fetchUserProfile(token);
        } catch (err) {
            console.error('Error fetching accounts:', err);
            setError('Không thể tải thông tin tài khoản');
        }
    }, [fetchUserProfile]);

    const LoginAccount = useCallback(async (email: string, password: string): Promise<string | null> => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch(`${API_BASE}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Login failed");
            }
            
            const data: LoginResponse = await response.json();
            
            if (data.data && data.data.token) {
                const { token, user } = data.data;
                localStorage.setItem('token', token);
                setAuth({
                    token,
                    user
                });
                
                return token;
            } else {
                throw new Error("Token not found in response");
            }
        } catch  {
            const errorMessage = "Không thể đăng nhập tài khoản";
            setError(errorMessage);
            console.error('Login error:');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        setAuth(null);
        setError(null);
    }, []);
    const isAuthenticated = useMemo(() => !!auth?.token, [auth]);
    const user = useMemo(() => auth?.user || null, [auth]);

    return {
        auth,
        user,
        isAuthenticated,
        loading,
        error,
        LoginAccount,
        logout,
        fetchAccounts,
        setError: useCallback((error: string | null) => setError(error), [])
    };
}