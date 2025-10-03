import { useAccount } from "../../../hooks/useAccount";
import { ErrorAlert } from "../../../components/ErrorAlert/ErrorAlert";
import { AccountAction } from "../../../components/Account/AccountAction";
import { AccountFilters } from "../../../components/Account/AccountFilters";
import { useAdminAuth } from "../../../context/AuthContext";

interface Account {
  _id: string;
  fullName: string;
  email: string;
  password: string;
  phone: string;
  role: string;
  avatar: string;
  createdAt: string;
  updatedAt: string;
  token: string;
  role_id: string;
  status: string;
}

function Account() {
  const {hasPermission} = useAdminAuth();
  const {
    accounts,
    filteredAccounts, 
    loading,
    error,
    keyword,
    setKeyword,
    filterStatus,
    setFilterStatus,
    setError,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    totalPages,
    deleteAccount,
    handleStatusChange,
  } = useAccount();

  // Hàm xử lý xóa tài khoản
  const handleDelete = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa tài khoản này?")) {
      await deleteAccount(id);
    }
  };

  // Hàm xử lý thay đổi trạng thái
  const handleToggleStatus = async (id: string, currentStatus: string) => {
    await handleStatusChange(id, currentStatus);
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
    <>
      <div className="min-h-screen p-6 bg-gray-50">
        <h1 className="text-2xl font-semibold text-gray-900">
          Danh sách tài khoản
        </h1>
        <p className="mt-1 text-gray-600">Quản lý danh sách tài khoản</p>

        {error && <ErrorAlert error={error} onClose={() => setError(null)} />}

        <div className="mb-6 bg-white border border-gray-200 rounded-lg">
          <AccountFilters
            keyword={keyword}
            setKeyword={setKeyword}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
          />

          <AccountAction />
        </div>

        <div className="overflow-hidden bg-white border border-gray-200 rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    STT
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Tên
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Số điện thoại
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {accounts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      {keyword
                        ? "Không tìm thấy tài khoản nào phù hợp"
                        : "Không có tài khoản nào"}
                    </td>
                  </tr>
                ) : (
                  accounts.map((account, index) => (
                    <tr key={account._id} className="hover:bg-gray-100">
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {account.fullName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                        {account.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                        {account.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            account.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {account.status === "active"
                            ? "Hoạt động"
                            : "Không hoạt động"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                        <div className="flex space-x-2">
                          {hasPermission('accounts_edit') && (
                          <button
                            onClick={() =>
                              (window.location.href = `/admin/accounts/edit/${account._id}`)
                            }
                            className="px-2 py-1 text-xs text-blue-800 bg-blue-100 rounded hover:bg-blue-200"
                          >
                            Sửa
                          </button>
                          )}
                          <button
                            onClick={() =>
                              handleToggleStatus(account._id, account.status)
                            }
                            className={`px-2 py-1 text-xs rounded ${
                              account.status === "active"
                                ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                                : "bg-green-100 text-green-800 hover:bg-green-200"
                            }`}
                          >
                            {account.status === "active"
                              ? "Vô hiệu hóa"
                              : "Kích hoạt"}
                          </button>
                          {hasPermission('accounts_delete') && (
                          <button
                            onClick={() => handleDelete(account._id)}
                            className="px-2 py-1 text-xs text-red-800 bg-red-100 rounded hover:bg-red-200"
                          >
                            Xóa
                          </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-3 bg-white border-t border-gray-200">
              <div className="flex items-center text-sm text-gray-700">
                <span>
                  Hiển thị {(currentPage - 1) * itemsPerPage + 1} -{" "}
                  {Math.min(
                    currentPage * itemsPerPage,
                    filteredAccounts.length
                  )}{" "}
                  của {filteredAccounts.length} kết quả
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Trước
                </button>

                {/* Page numbers */}
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-2 py-1 text-sm rounded ${
                          currentPage === pageNum
                            ? "bg-indigo-500 text-white"
                            : "border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Account;
