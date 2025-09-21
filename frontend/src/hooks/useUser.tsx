// hooks/useAuth.ts
import { useState, useCallback } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
  token?: string;
}

// Base URL cho API
const API_BASE_URL = 'http://localhost:3000';

// Hook chính để quản lý authentication state
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const isAuthenticated = !!user;

  // Utility functions
  const getToken = useCallback((): string | null => {
    try {
      return sessionStorage.getItem('token') || localStorage.getItem('token');
    } catch {
      return null;
    }
  }, []);

  const setToken = useCallback((token: string) => {
    try {
      sessionStorage.setItem('token', token);
    } catch (error) {
      console.error('Error saving token:', error);
    }
  }, []);

  const clearAuthData = useCallback(() => {
    try {
      sessionStorage.removeItem('token');
      localStorage.removeItem('token');
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  }, []);

  const checkAuthStatus = useCallback(async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) {
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/users/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data: ApiResponse = await response.json();
        if (data.success) {
          const userData = {
            ...data.data,
            id: data.data._id || data.data.id
          };
          setUser(userData);
        } else {
          clearAuthData();
        }
      } else {
        clearAuthData();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      clearAuthData();
    } finally {
      setLoading(false);
    }
  }, [getToken, clearAuthData]);

  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/v1/users/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data: ApiResponse = await response.json();
        if (data.success) {
          const userData = {
            ...data.data,
            id: data.data._id || data.data.id
          };
          setUser(userData);
        }
      }
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  }, [getToken]);

  return {
    user,
    loading,
    isAuthenticated,
    setUser,
    setLoading,
    getToken,
    setToken,
    clearAuthData,
    checkAuthStatus,
    refreshUser,
  };
};

// Hook cho đăng nhập
export const useLogin = () => {
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (
    email: string, 
    password: string,
    setUser: (user: User) => void,
    setToken: (token: string) => void
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      setLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/api/v1/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data: ApiResponse = await response.json();

      if (response.ok && data.success) {
        const { token } = data;
        const userData = {
          ...data.data,
          id: data.data._id || data.data.id 
        };
        
        setUser(userData);
        if (token) {
          setToken(token);
        }
        
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message || 'Đăng nhập thất bại' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Lỗi kết nối. Vui lòng thử lại!' };
    } finally {
      setLoading(false);
    }
  }, []);

  return { login, loading };
};

// Hook cho đăng ký
export const useRegister = () => {
  const [loading, setLoading] = useState(false);

  const register = useCallback(async (userData: RegisterData): Promise<{ success: boolean; message?: string }> => {
    try {
      setLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/api/v1/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data: ApiResponse = await response.json();

      if (response.ok && data.success) {
        return { success: true, message: data.message || 'Đăng ký thành công!' };
      } else {
        return { success: false, message: data.message || 'Đăng ký thất bại' };
      }
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, message: 'Lỗi kết nối. Vui lòng thử lại!' };
    } finally {
      setLoading(false);
    }
  }, []);

  return { register, loading };
};

// Hook cho đăng xuất
export const useLogout = () => {
  const logout = useCallback(async (
    setUser: (user: User | null) => void,
    getToken: () => string | null,
    clearAuthData: () => void
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const token = getToken();
      if (token) {
        await fetch(`${API_BASE_URL}/api/v1/users/logout`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }

      setUser(null);
      clearAuthData();
      
      return { success: true, message: 'Đăng xuất thành công' };
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
      clearAuthData();
      return { success: true, message: 'Đăng xuất thành công' };
    }
  }, []);

  return { logout };
};

// Hook cho cập nhật profile
export const useUpdateProfile = () => {
  const [loading, setLoading] = useState(false);

  const updateProfile = useCallback(async (
    userData: Partial<User>,
    getToken: () => string | null
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) {
        return { success: false, message: 'Vui lòng đăng nhập lại' };
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/users/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data: ApiResponse = await response.json();

      if (response.ok && data.success) {
        return { success: true, message: data.message || 'Cập nhật thông tin thành công!' };
      } else {
        return { success: false, message: data.message || 'Cập nhật thông tin thất bại' };
      }
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, message: 'Lỗi kết nối. Vui lòng thử lại!' };
    } finally {
      setLoading(false);
    }
  }, []);

  return { updateProfile, loading };
};

// Hook cho quên mật khẩu
export const useForgotPassword = () => {
  const [loading, setLoading] = useState(false);

  const forgotPassword = useCallback(async (email: string): Promise<{ success: boolean; message?: string }> => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/v1/users/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data: ApiResponse = await response.json();
      return { success: data.success, message: data.message };
    } catch (error) {
      console.error('Forgot password error:', error);
      return { success: false, message: 'Lỗi kết nối. Vui lòng thử lại!' };
    } finally {
      setLoading(false);
    }
  }, []);

  return { forgotPassword, loading };
};

// Hook cho xác thực OTP
export const useVerifyOTP = () => {
  const [loading, setLoading] = useState(false);

  const verifyOTP = useCallback(async (
    email: string, 
    otp: string
  ): Promise<{ success: boolean; message?: string; token?: string }> => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/v1/users/otp-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, otp }),
      });

      const data: ApiResponse = await response.json();
      
      if (data.success) {
        return { 
          success: true, 
          message: data.message,
          token: data.token 
        };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      return { success: false, message: 'Lỗi kết nối. Vui lòng thử lại!' };
    } finally {
      setLoading(false);
    }
  }, []);

  return { verifyOTP, loading };
};

// Hook cho reset mật khẩu
export const useResetPassword = () => {
  const [loading, setLoading] = useState(false);

  const resetPassword = useCallback(async (password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/v1/users/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ password }),
      });

      const data: ApiResponse = await response.json();
      return { success: data.success, message: data.message };
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, message: 'Lỗi kết nối. Vui lòng thử lại!' };
    } finally {
      setLoading(false);
    }
  }, []);

  return { resetPassword, loading };
};