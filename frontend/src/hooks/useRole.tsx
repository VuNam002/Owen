import { useCallback, useEffect, useState } from "react";

interface Role {
  _id: string;
  title: string;
  description: string;
}

interface ApiResponse {
  data: Role[];
}

const API_BASE = "http://localhost:3000/api/v1/roles";

// Hàm gọi API chung
const apiRequest = async (
  url: string,
  option: RequestInit = {}
): Promise<ApiResponse> => {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...option,
  });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

// Custom Hook quản lý Roles
export const useRole = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lấy danh sách roles
  const fetchRoles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiRequest(API_BASE);
      setRoles(result.data);
    } catch {
      setError("Không thể tải dữ liệu vai trò");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // Tạo role mới
  const createRole = async (roleData: Omit<Role, "_id">): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await apiRequest(`${API_BASE}/create`, {
        method: "POST",
        body: JSON.stringify(roleData),
      });
      await fetchRoles();
      return true;
    } catch {
      setError("Không thể tạo vai trò");
      return false;
    } finally {
      setLoading(false);
    }
  };
  const updateRole = async (
    id: string,
    roleData: Partial<Role>
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await apiRequest(`${API_BASE}/edit/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(roleData),
      });
      await fetchRoles();
      return true;
    } catch {
      setError("Không thể cập nhật vai trò");
      return false;
    } finally {
      setLoading(false);
    }
  };
  const deleteRole = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await apiRequest(`${API_BASE}/delete/${id}`, {
        method: "DELETE",
      });
      await fetchRoles();
    } catch {
      setError("Không thể xóa vai trò");
    } finally {
      setLoading(false);
    }
  };
  return {
    roles,
    loading,
    error,
    fetchRoles,
    createRole,
    updateRole,
    deleteRole
  }
};