import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  role: {
    title: string;
    permissions: string[];
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean; // Add loading state
  login: (email: string, password: string) => Promise<boolean>; // Changed return type and parameters
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    // Load user from localStorage or fetch from API on app load
    const storedUser = localStorage.getItem('user');
    console.log("AuthContext: storedUser from localStorage:", storedUser);
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log("AuthContext: parsedUser:", parsedUser);
        setUser(parsedUser);
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
        localStorage.removeItem('user'); // Clear invalid data
      }
    } else {
      console.log("AuthContext: No user in localStorage");
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
        const userData = data.data; // Adjust based on your backend response structure
        const token = userData.token; // Adjust based on your backend response structure

        const userToStore = {
          id: userData._id,
          username: userData.fullName,
          role: {
            name: userData.role.name,
            permissions: userData.role.permissions,
          },
        };
        console.log("AuthContext: setting user in login:", userToStore);
        setUser(userToStore);
        localStorage.setItem('user', JSON.stringify(userToStore));
        localStorage.setItem('token', token);
        return true; // Login successful
      } else {
        console.error('Login failed:', data.message || 'Unknown error');
        // You might want to set an error state here
        return false; // Login failed
      }
    } catch (error) {
      console.error('Login API call error:', error);
      // You might want to set an error state here
      return false; // Login failed due to network error or similar
    }
  };

  const logout = () => {
    console.log("AuthContext: logging out user");
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const hasPermission = (permission: string): boolean => {
    return user?.role?.permissions.includes(permission) || false;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
