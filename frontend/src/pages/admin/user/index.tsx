import { useState, useEffect } from 'react';
import { useUserClient } from "../../../hooks/userAdmin";

interface UserClient {
    id: string;
    name: string;
    email: string;
    phone: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

function UserList() {
    const {
        userClients,
        loading,
        error,
        keyword,
        filterStatus,
        currentPage,
        itemsPerPage,
        filterUserClients,
        setKeyword,
        setFilterStatus,
        setCurrentPage,
        setItemsPerPage,
        fetchUserClients,
        updateUserStatus,
        deleteUserClient,
        clearError
    } = useUserClient();

    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [userToDelete, setUserToDelete] = useState<string | null>(null);
    const [showMultiDeleteConfirm, setShowMultiDeleteConfirm] = useState(false);

    // Load dữ liệu khi component mount
    useEffect(() => {
        fetchUserClients();
    }, [fetchUserClients]);

    // Reset current page to 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [keyword, filterStatus, setCurrentPage]);

    // Clear selected users when switching pages
    useEffect(() => {
        setSelectedUsers([]);
    }, [currentPage]);

    // Tính toán pagination
    const totalItems = filterUserClients.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentUsers = filterUserClients.slice(startIndex, endIndex);

    // Xử lý chọn user
    const handleSelectUser = (userId: string) => {
        setSelectedUsers(prev => 
            prev.includes(userId) 
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleSelectAll = () => {
        if (selectedUsers.length === currentUsers.length && currentUsers.length > 0) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(currentUsers.map(user => user.id));
        }
    };

    // Xử lý thay đổi trạng thái - chỉ có 3 trạng thái: active, inactive, suspended
    const handleStatusChange = async (userId: string, currentStatus: string) => {
        // Xác định trạng thái tiếp theo trong chu kỳ: active -> inactive -> suspended -> active
        let nextStatus: string;
        switch (currentStatus) {
            case 'active':
                nextStatus = 'inactive';
                break;
            case 'inactive':
                nextStatus = 'suspended';
                break;
            case 'suspended':
                nextStatus = 'active';
                break;
            default:
                nextStatus = 'active';
        }

        try {
            await updateUserStatus(userId, nextStatus);
        } catch (error) {
            console.error('Error updating user status:', error);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        try {
            await deleteUserClient(userId);
            setSelectedUsers(prev => prev.filter(id => id !== userId));
            setShowDeleteConfirm(false);
            setUserToDelete(null);
            
            // Adjust current page if needed after deletion
            const newTotalItems = filterUserClients.length - 1;
            const newTotalPages = Math.ceil(newTotalItems / itemsPerPage);
            if (currentPage > newTotalPages && newTotalPages > 0) {
                setCurrentPage(newTotalPages);
            }
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    // Xử lý xóa nhiều user (xóa từng cái một)
    const handleDeleteMultiple = async () => {
        if (selectedUsers.length === 0) return;
        
        try {
            // Xóa từng user một cách tuần tự
            for (const userId of selectedUsers) {
                await deleteUserClient(userId);
            }
            
            setSelectedUsers([]);
            setShowMultiDeleteConfirm(false);
            
            // Adjust current page if needed after deletion
            const newTotalItems = filterUserClients.length - selectedUsers.length;
            const newTotalPages = Math.ceil(newTotalItems / itemsPerPage);
            if (currentPage > newTotalPages && newTotalPages > 0) {
                setCurrentPage(newTotalPages);
            }
        } catch (error) {
            console.error('Error deleting multiple users:', error);
        }
    };

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Status badge color - chỉ có 3 trạng thái
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active': return 'bg-green-100 text-green-800 hover:bg-green-200';
            case 'inactive': return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
            case 'suspended': return 'bg-red-100 text-red-800 hover:bg-red-200';
            default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
        }
    };

    // Hiển thị trạng thái bằng tiếng Việt
    const getStatusText = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active': return 'Hoạt động';
            case 'inactive': return 'Không hoạt động';
            case 'suspended': return 'Tạm khóa';
            default: return status;
        }
    };

    // Show loading when data is being fetched
    if (loading && userClients.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 border-b-2 border-blue-500 rounded-full animate-spin"></div>
                    <span className="text-gray-600">Đang tải dữ liệu...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow">
            <div className="mb-6">
                <h1 className="mb-4 text-2xl font-bold text-gray-900">Quản lý người dùng</h1>
                
                {/* Filters */}
                <div className="flex flex-col gap-4 mb-4 sm:flex-row">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên, email..."
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div className="sm:w-48">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="active">Hoạt động</option>
                            <option value="inactive">Không hoạt động</option>
                            <option value="suspended">Tạm khóa</option>
                        </select>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-2">
                        {selectedUsers.length > 0 && (
                            <button
                                onClick={() => setShowMultiDeleteConfirm(true)}
                                className="px-4 py-2 text-white transition-colors bg-red-500 rounded-md hover:bg-red-600"
                                disabled={loading}
                            >
                                {loading ? 'Đang xóa...' : `Xóa đã chọn (${selectedUsers.length})`}
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Hiển thị:</span>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="px-2 py-1 text-sm border border-gray-300 rounded"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Error message */}
            {error && (
                <div className="p-4 mb-4 border border-red-200 rounded-md bg-red-50">
                    <div className="flex items-center justify-between">
                        <p className="text-red-600">{error}</p>
                        <button
                            onClick={clearError}
                            className="text-red-400 hover:text-red-600"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}

            {/* Loading overlay for table */}
            <div className="relative">
                {loading && userClients.length > 0 && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white bg-opacity-75">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 border-b-2 border-blue-500 rounded-full animate-spin"></div>
                            <span className="text-gray-600">Đang cập nhật...</span>
                        </div>
                    </div>
                )}

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left">
                                    <input
                                        type="checkbox"
                                        checked={selectedUsers.length === currentUsers.length && currentUsers.length > 0}
                                        onChange={handleSelectAll}
                                        className="text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        disabled={currentUsers.length === 0}
                                    />
                                </th>
                                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                    Tên
                                </th>
                                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                    Trạng thái
                                </th>
                                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                    Ngày tạo
                                </th>
                                <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedUsers.includes(user.id)}
                                            onChange={() => handleSelectUser(user.id)}
                                            className="text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {user.name}
                                            {user.name === user.email.split('@')[0] && (
                                                <span className="ml-2 text-xs text-gray-500">(từ email)</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{user.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => handleStatusChange(user.id, user.status)}
                                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full cursor-pointer transition-colors ${getStatusColor(user.status)}`}
                                            disabled={loading}
                                        >
                                            {getStatusText(user.status)}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                        {formatDate(user.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                                        <div className="flex justify-end gap-2">
                                            <button className="text-blue-600 hover:text-blue-900">
                                                Chi tiết
                                            </button>
                                            <button className="text-green-600 hover:text-green-900">
                                                Sửa
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    setUserToDelete(user.id);
                                                    setShowDeleteConfirm(true);
                                                }}
                                                className="text-red-600 hover:text-red-900"
                                                disabled={loading}
                                            >
                                                Xóa
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Empty state */}
            {currentUsers.length === 0 && !loading && (
                <div className="py-12 text-center">
                    <p className="text-lg text-gray-500">
                        {keyword || filterStatus ? 'Không tìm thấy người dùng phù hợp' : 'Chưa có người dùng nào'}
                    </p>
                    {(keyword || filterStatus) && (
                        <button
                            onClick={() => {
                                setKeyword('');
                                setFilterStatus('');
                            }}
                            className="mt-2 text-blue-600 hover:text-blue-800"
                        >
                            Xóa bộ lọc
                        </button>
                    )}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-gray-700">
                        Hiển thị {startIndex + 1} - {Math.min(endIndex, totalItems)} của {totalItems} kết quả
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1 || loading}
                            className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            Trước
                        </button>
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                            let page;
                            if (totalPages <= 5) {
                                page = i + 1;
                            } else if (currentPage <= 3) {
                                page = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                                page = totalPages - 4 + i;
                            } else {
                                page = currentPage - 2 + i;
                            }
                            return (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    disabled={loading}
                                    className={`px-3 py-1 border rounded-md disabled:opacity-50 ${
                                        currentPage === page
                                            ? 'bg-blue-500 text-white border-blue-500'
                                            : 'border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    {page}
                                </button>
                            );
                        })}
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages || loading}
                            className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            Sau
                        </button>
                    </div>
                </div>
            )}

            {/* Delete Single User Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="w-full max-w-md p-6 mx-4 bg-white rounded-lg">
                        <h3 className="mb-4 text-lg font-semibold">Xác nhận xóa</h3>
                        <p className="mb-6 text-gray-600">
                            Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.
                        </p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => {
                                    setShowDeleteConfirm(false);
                                    setUserToDelete(null);
                                }}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                                disabled={loading}
                            >
                                Hủy
                            </button>
                            <button
                                onClick={() => userToDelete && handleDeleteUser(userToDelete)}
                                className="px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-600 disabled:opacity-50"
                                disabled={loading}
                            >
                                {loading ? 'Đang xóa...' : 'Xóa'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Multiple Users Confirmation Modal */}
            {showMultiDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="w-full max-w-md p-6 mx-4 bg-white rounded-lg">
                        <h3 className="mb-4 text-lg font-semibold">Xác nhận xóa nhiều người dùng</h3>
                        <p className="mb-6 text-gray-600">
                            Bạn có chắc chắn muốn xóa {selectedUsers.length} người dùng đã chọn? Hành động này không thể hoàn tác.
                        </p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setShowMultiDeleteConfirm(false)}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                                disabled={loading}
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleDeleteMultiple}
                                className="px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-600 disabled:opacity-50"
                                disabled={loading}
                            >
                                {loading ? 'Đang xóa...' : 'Xóa tất cả'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserList;