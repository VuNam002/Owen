import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useRole } from "../../../hooks/useRole"; 

// Định nghĩa kiểu dữ liệu cho Role
interface Role {
  _id: string;
  title: string;
  permissions: string[];
}
// Định nghĩa các nhóm quyền và quyền hạn
const permissionConfig = [
  {
    name: 'Danh mục sản phẩm',
    permissions: [
      { key: 'product-category_view', label: 'Xem' },
      { key: 'product-category_create', label: 'Thêm mới' },
      { key: 'product-category_edit', label: 'Chỉnh sửa' },
      { key: 'product-category_delete', label: 'Xóa' },
    ],
  },
  {
    name: 'Sản phẩm',
    permissions: [
      { key: 'product_view', label: 'Xem' },
      { key: 'product_create', label: 'Thêm mới' },
      { key: 'product_edit', label: 'Chỉnh sửa' },
      { key: 'product_delete', label: 'Xóa' },
    ],
  },
  {
    name: 'Nhóm quyền',
    permissions: [
        { key: 'roles_view', label: 'Xem' },
        { key: 'roles_create', label: 'Thêm mới' },
        { key: 'roles_edit', label: 'Chỉnh sửa' },
        { key: 'roles_delete', label: 'Xóa' },
        { key: 'roles_permissions', label: 'Phân quyền' },
    ]
  },
  {
    name: 'Tài khoản',
    permissions: [
        { key: 'accounts_view', label: 'Xem' },
        { key: 'accounts_create', label: 'Thêm mới' },
        { key: 'accounts_edit', label: 'Chỉnh sửa' },
        { key: 'accounts_delete', label: 'Xóa' },
    ]
  }
  // Thêm các nhóm quyền khác nếu cần
];

const PermissionsPage: React.FC = () => {
  const { roles: fetchedRoles, loading } = useRole(); 
  const [roles, setRoles] = useState<Role[]>([]);
  useEffect(() => {
    if (fetchedRoles.length > 0) {
      setRoles(fetchedRoles);
    }
  }, [fetchedRoles]);

  const handlePermissionChange = (roleId: string, permissionKey: string, isChecked: boolean) => {
    setRoles(prevRoles =>
      prevRoles.map(role => {
        if (role._id === roleId) {
          const newPermissions = isChecked
            ? [...role.permissions, permissionKey]
            : role.permissions.filter(p => p !== permissionKey);
          return { ...role, permissions: newPermissions };
        }
        return role;
      })
    );
  };

  const handleSubmit = async () => {
    try {
      const permissionsToUpdate = roles.map(role => ({
        id: role._id,
        permissions: role.permissions,
      }));
      
      const response = await fetch('/api/v1/roles/permissions', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          permissions: JSON.stringify(permissionsToUpdate)
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        toast.success('Cập nhật phân quyền thành công!');
      } else {
        toast.error(result.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      toast.error('Lỗi khi cập nhật phân quyền');
      console.error(error);
    }
  };

  if (loading) {
    return <div className="p-6">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Phân quyền</h1>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
        >
          Cập nhật
        </button>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-full bg-white rounded-lg shadow">
            {permissionConfig.map(group => (
                <div key={group.name} className="mb-8">
                    <h2 className="p-4 text-xl font-semibold border-b">{group.name}</h2>
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="w-1/4 px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Tính năng</th>
                                {roles.map(role => (
                                    <th key={role._id} className="px-6 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase w-1/q uarter">
                                        {role.title}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {group.permissions.map(permission => (
                                <tr key={permission.key}>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">{permission.label}</td>
                                    {roles.map(role => (
                                        <td key={role._id} className="px-6 py-4 text-sm text-center text-gray-500 whitespace-nowrap">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                checked={role.permissions.includes(permission.key)}
                                                onChange={e => handlePermissionChange(role._id, permission.key, e.target.checked)}
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default PermissionsPage;
