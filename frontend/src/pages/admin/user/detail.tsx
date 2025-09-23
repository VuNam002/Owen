import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUserClient } from '../../../hooks/userAdmin'; 

interface UserClient {
    id: string;
    name: string;
    email: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

function UserDetail() {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const [user, setUser] = useState<UserClient | null>(null);
    
    // Use the custom hook
    const { 
        getUserClientById, 
        loading, 
        error, 
        clearError 
    } = useUserClient();

    useEffect(() => {
        const fetchUser = async () => {
            if (!userId) {
                return;
            }

            try {
                // Clear any previous errors
                clearError();
                
                // Use the hook's method to fetch user by ID
                const userData = await getUserClientById(userId);
                setUser(userData);
            } catch (error) {
                console.error('Error fetching user details:', error);
                // Error is already handled by the hook
            }
        };

        fetchUser();
    }, [userId, getUserClientById, clearError]);

    if (loading) {
        return <div className="flex items-center justify-center h-64"><div className="text-lg">Đang tải...</div></div>;
    }

    if (error) {
        return <div className="px-4 py-3 mb-4 text-red-700 bg-red-100 border border-red-400 rounded">{error}</div>;
    }

    if (!user) {
        return <div className="flex items-center justify-center h-64"><div className="text-lg">Không tìm thấy người dùng</div></div>;
    }

    return (
        <div className="container px-4 py-6 mx-auto">
            <div className="max-w-2xl mx-auto">
                <h1 className="mb-6 text-2xl font-bold">Chi tiết người dùng</h1>

                <div className="p-6 bg-white rounded-lg shadow">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="col-span-2">
                            <p className="text-sm text-gray-500">ID</p>
                            <p>{user.id}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Tên</p>
                            <p>{user.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p>{user.email}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Trạng thái</p>
                            <p>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                    user.status === 'active' 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-red-100 text-red-800'
                                }`}>
                                    {user.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                                </span>
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Ngày tạo</p>
                            <p>{new Date(user.createdAt).toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Ngày cập nhật</p>
                            <p>{new Date(user.updatedAt).toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end mt-6">
                    <button 
                        type="button" 
                        onClick={() => navigate("/admin/users")}
                        className="px-6 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        Quay lại
                    </button>
                </div>
            </div>
        </div>
    );
}

export default UserDetail;
