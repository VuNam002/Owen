// contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect } from 'react';
import {
  useAuth,
  useLogin,
  useRegister,
  useLogout,
  useUpdateProfile,
  useForgotPassword,
  useVerifyOTP,
  useResetPassword
} from '../hooks/useUser.tsx';

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

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<{ success: boolean; message?: string }>;
  updateProfile: (userData: Partial<User>) => Promise<{ success: boolean; message?: string }>;
  refreshUser: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message?: string }>;
  verifyOTP: (email: string, otp: string) => Promise<{ success: boolean; message?: string; token?: string }>;
  resetPassword: (password: string) => Promise<{ success: boolean; message?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Sử dụng các hooks
  const auth = useAuth();
  const loginHook = useLogin();
  const registerHook = useRegister();
  const logoutHook = useLogout();
  const updateProfileHook = useUpdateProfile();
  const forgotPasswordHook = useForgotPassword();
  const verifyOTPHook = useVerifyOTP();
  const resetPasswordHook = useResetPassword();

  // Check auth status khi component mount
  useEffect(() => {
    auth.checkAuthStatus();
  }, [auth.checkAuthStatus]);

  // Wrapper functions để kết nối hooks với context
  const login = async (email: string, password: string) => {
    return loginHook.login(email, password, auth.setUser, auth.setToken);
  };

  const register = async (userData: RegisterData) => {
    return registerHook.register(userData);
  };

  const logout = async () => {
    return logoutHook.logout(auth.setUser, auth.getToken, auth.clearAuthData);
  };

  const updateProfile = async (userData: Partial<User>) => {
    return updateProfileHook.updateProfile(userData, auth.getToken);
  };

  const forgotPassword = async (email: string) => {
    return forgotPasswordHook.forgotPassword(email);
  };

  const verifyOTP = async (email: string, otp: string) => {
    return verifyOTPHook.verifyOTP(email, otp);
  };

  const resetPassword = async (password: string) => {
    return resetPasswordHook.resetPassword(password);
  };

  const value: AuthContextType = {
    user: auth.user,
    loading: auth.loading || loginHook.loading || registerHook.loading || updateProfileHook.loading || forgotPasswordHook.loading || verifyOTPHook.loading || resetPasswordHook.loading,
    isAuthenticated: auth.isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    refreshUser: auth.refreshUser,
    forgotPassword,
    verifyOTP,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook để sử dụng context
export const useUser = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useUser must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;