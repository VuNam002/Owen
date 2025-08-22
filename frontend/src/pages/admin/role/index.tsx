import { useRole } from "../../../hooks/useRole";
import { RoleAction } from "../../../components/Role/RoleAction";

interface Role {
  _id: string;
  title: string;
  description: string;
}

function RolePage() {
  const { roles, loading, deleteRole } = useRole();

  const handleDelete = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa không?")) {
      await deleteRole(id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 bg-gray-50">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Đang tải...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <h1 className="text-2xl font-semibold text-gray-900">Nhóm quyền</h1>
      <p className="mt-1 text-sm text-gray-600">
        Quản lý danh sách nhóm quyền
      </p>

      <RoleAction/>

      <div className="overflow-hidden bg-white border border-gray-200 rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  STT
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Nhóm quyền
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Mô tả
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {roles.length > 0 ? (
                roles.map((role: Role, index: number) => (
                  <tr key={role._id} className="hover:bg-gray-100">
                    <td className="px-6 py-4">{index + 1}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {role.title}
                    </td>
                    <td className="px-6 py-4" dangerouslySetInnerHTML={{ __html: role.description }}></td>
                    <td className="px-6 py-4 space-x-2">
                      <button
                        onClick={() => handleDelete(role._id)}
                        className="px-3 py-1 text-white bg-red-500 rounded-md hover:bg-red-600"
                      >
                        Xóa
                      </button>
                      <button
                        onClick={() => (window.location.href = `/admin/roles/edit/${role._id}`)}
                        className="px-3 py-1 text-white bg-blue-500 rounded-md hover:bg-blue-600"
                      >
                        Sửa
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Không có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default RolePage;
