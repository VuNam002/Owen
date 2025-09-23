import React, { createContext, useContext, useState, useEffect } from 'react';

interface Admin {
  id: string;
  username: string;
  role: {
    title: string;
    permissions: string[];
  };
}

interface AdminContextType {
  admin: Admin | null;
  loading: boolean; // Add loading state
  login: (email: string, password: string) => Promise<boolean>; // Changed return type and parameters
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    // Load admin from localStorage or fetch from API on app load
    const storedAdmin = localStorage.getItem('admin');
    if (storedAdmin) {
      try {
        const parsedAdmin = JSON.parse(storedAdmin);
        setAdmin(parsedAdmin);
      } catch (e) {
        localStorage.removeItem('admin'); // Clear invalid data
      }
    }
    setLoading(false); // Set loading to false after checking local storage
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => { // Made async and added return type
    try {
      const response = await fetch('http://localhost:3000/api/v1/auth/login', { // Your backend login endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Assuming your backend returns user data and token on successful login
        const adminData = data.data; // Adjust based on your backend response structure
        const token = adminData.token; // Adjust based on your backend response structure

        const adminToStore = {
          id: adminData._id,
          username: adminData.fullName,
          role: {
            name: adminData.role.name,
            permissions: adminData.role.permissions,
          },
        };
        setAdmin(adminToStore);
        localStorage.setItem('admin', JSON.stringify(adminToStore));
        localStorage.setItem('admin_token', token);
        return true; // Login successful
      } else {
        return false; 
      }
    } catch (error) {
      return false; // Login failed due to network error or similar
    }
  };

  const logout = () => {
    setAdmin(null);
    localStorage.removeItem('admin');
    localStorage.removeItem('admin_token');
  };

  const hasPermission = (permission: string): boolean => {
    return admin?.role?.permissions.includes(permission) || false;
  };

  return (
    <AdminContext.Provider value={{ admin, loading, login, logout, hasPermission }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminProvider');
  }
  return context;
};
