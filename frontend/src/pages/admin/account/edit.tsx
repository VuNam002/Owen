import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAccount } from "../../../hooks/useAccount";
import { toast } from 'react-toastify';

interface FormData {
    fullName: string;
    email: string;
    password?: string; 
    phone: string;
    status: string;
    role_id: string;
}

interface Role {
    _id?: string;
    id?: string;
    title?: string;
    name?: string;
}

const EditAccount: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { updateAccount, loading, error } = useAccount();
    
    const [formData, setFormData] = useState<Omit<FormData, 'token'>>({
        fullName: '',
        email: '',
        password: '', 
        phone: '',
        status: 'active',
        role_id: ''
    });
    const [formErrors, setFormErrors] = useState<Partial<FormData>>({});
    const [roles, setRoles] = useState<Role[]>([]);
    const [rolesLoading, setRolesLoading] = useState(true);
    const [accountLoading, setAccountLoading] = useState(true);

    const fetchRoles = useCallback(async () => {
        try {
            setRolesLoading(true);
            const response = await fetch('http://localhost:3000/api/v1/roles');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Roles response:', data);
            let rolesArray: Role[] = [];
            
            if (Array.isArray(data)) {
                rolesArray = data;
            } else if (data?.success && Array.isArray(data.data)) {
                rolesArray = data.data;
            } else if (Array.isArray(data?.data)) {
                rolesArray = data.data;
            } else if (Array.isArray(data?.roles)) {
                rolesArray = data.roles;
            } else {
                console.warn('Unexpected roles data structure:', data);
                rolesArray = [];
            }
            
            setRoles(rolesArray);
        } catch (error) {
            console.error('Error fetching roles:', error);
            toast.error('Không thể tải danh sách quyền');
            setRoles([]);
        } finally {
            setRolesLoading(false);
        }
    }, []);

    const fetchAccountData = useCallback(async () => {
        if (!id) {
            console.log('No ID provided');
            setAccountLoading(false);
            return;
        }

        try {
            setAccountLoading(true);
            console.log('Fetching account with ID:', id);
            
            const response = await fetch(`http://localhost:3000/api/v1/accounts/detail/${id}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            const accountDetails = data.data || data;
            
            console.log('Account detail from API:', accountDetails);
            
            if (accountDetails) {
                setFormData({
                    fullName: accountDetails.fullName || '',
                    email: accountDetails.email || '',
                    phone: accountDetails.phone || '',
                    status: accountDetails.status || 'active',
                    role_id: accountDetails.role_id || accountDetails.roleId || '', 
                    password: '', 
                });
            } else {
                console.warn('Account not found');
                toast.error('Không tìm thấy tài khoản');
                setTimeout(() => navigate('/admin/accounts'), 2000);
            }
        } catch (error) {
            console.error('Error fetching account:', error);
            toast.error('Không thể tải thông tin tài khoản: ' + (error instanceof Error ? error.message : 'Unknown error'));
            setTimeout(() => navigate('/admin/accounts'), 2000);
        } finally {
            setAccountLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        fetchRoles();
    }, [fetchRoles]);

    useEffect(() => {
        fetchAccountData();
    }, [fetchAccountData]);

    const validateForm = useCallback((): boolean => {
        const errors: Partial<FormData> = {};

        if (!formData.fullName.trim()) {
            errors.fullName = 'Họ tên là bắt buộc';
        }

        if (!formData.email.trim()) {
            errors.email = 'Email là bắt buộc';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'Email không hợp lệ';
        }

        // Password is optional for edit, but if provided, must be valid
        if (formData.password && formData.password.length < 6) {
            errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        }

        if (!formData.phone.trim()) {
            errors.phone = 'Số điện thoại là bắt buộc';
        } else if (!/^[0-9]{10,11}$/.test(formData.phone)) {
            errors.phone = 'Số điện thoại không hợp lệ';
        }

        if (!formData.role_id) {
            errors.role_id = 'Chọn quyền là bắt buộc';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    }, [formData]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (formErrors[name as keyof FormData]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    }, [formErrors]);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm() || !id) {
            return;
        }

        const dataToUpdate: any = { ...formData };
        if (!dataToUpdate.password || dataToUpdate.password.trim() === '') {
            delete dataToUpdate.password;
        }

        const success = await updateAccount(id, dataToUpdate);
        if (success) {
            toast.success('Cập nhật tài khoản thành công!');
            navigate('/admin/accounts');
        } else {
            toast.error('Cập nhật tài khoản thất bại');
            console.error('Failed to edit account');
        }
    }, [formData, validateForm, id, updateAccount, navigate]);

    const handleCancel = useCallback(() => {
        navigate('/admin/accounts');
    }, [navigate]);

    const isLoading = useMemo(() => accountLoading || rolesLoading, [accountLoading, rolesLoading]);
    if (isLoading) {
        return (
            <div className="max-w-full p-6 mx-auto bg-white rounded-lg shadow-lg">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="w-8 h-8 mx-auto mb-4 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
                        <p className="text-gray-600">Đang tải dữ liệu...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-full p-6 mx-auto bg-white rounded-lg shadow-lg">
            <h2 className="mb-6 text-2xl font-bold text-gray-800">Cập nhật tài khoản</h2>

            {error && (
                <div className="p-4 mb-4 border border-red-200 rounded-md bg-red-50">
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Họ tên */}
                <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                        Họ tên *
                    </label>
                    <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            formErrors.fullName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Nhập họ tên"
                    />
                    {formErrors.fullName && (
                        <p className="mt-1 text-sm text-red-500">{formErrors.fullName}</p>
                    )}
                </div>

                <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                        Email *
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            formErrors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Nhập email"
                    />
                    {formErrors.email && (
                        <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
                    )}
                </div>

                <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                        Mật khẩu (để trống nếu không thay đổi)
                    </label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            formErrors.password ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Nhập mật khẩu mới"
                    />
                    {formErrors.password && (
                        <p className="mt-1 text-sm text-red-500">{formErrors.password}</p>
                    )}
                </div>

                <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                        Số điện thoại *
                    </label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            formErrors.phone ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Nhập số điện thoại"
                    />
                    {formErrors.phone && (
                        <p className="mt-1 text-sm text-red-500">{formErrors.phone}</p>
                    )}
                </div>

                <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                        Trạng thái
                    </label>
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="active">Hoạt động</option>
                        <option value="inactive">Không hoạt động</option>
                    </select>
                </div>

                <div>
                    <label className='block mb-1 text-sm font-medium text-gray-700'>
                        Chọn quyền *
                    </label>
                    <select
                        name="role_id"
                        value={formData.role_id}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            formErrors.role_id ? 'border-red-500' : 'border-gray-300'
                        }`}
                    >
                        <option value="">Chọn quyền</option>
                        {roles.map((role) => (
                            <option key={role.id || role._id} value={role.id || role._id}>
                                {role.title || role.name}
                            </option>
                        ))}
                    </select>
                    {formErrors.role_id && (
                        <p className="mt-1 text-sm text-red-500">{formErrors.role_id}</p>
                    )}
                </div>

                <div className="flex pt-4 space-x-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Đang cập nhật...' : 'Cập nhật tài khoản'}
                    </button>
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="flex-1 px-4 py-2 text-white bg-gray-600 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                        Hủy
                    </button>
                </div>
            </form>
        </div>
    );
}

export default EditAccount;