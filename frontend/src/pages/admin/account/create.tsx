import React, { useState } from 'react';
import { useAccount } from '../../../hooks/useAccount'; 
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

interface FormData {
    fullName: string;
    email: string;
    password: string;
    phone: string;
    status: string;
    token: string;
}

const CreateAccount: React.FC = () => {
    const navigate = useNavigate();
    const { createAccount, loading, error } = useAccount();
    
    const [formData, setFormData] = useState<Omit<FormData, 'token'>>({
        fullName: '',
        email: '',
        password: '',
        phone: '',
        status: 'active',
    });

    const [formErrors, setFormErrors] = useState<Partial<FormData>>({});

    // Validate form
    const validateForm = (): boolean => {
        const errors: Partial<FormData> = {};

        if (!formData.fullName.trim()) {
            errors.fullName = 'Họ tên là bắt buộc';
        }

        if (!formData.email.trim()) {
            errors.email = 'Email là bắt buộc';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'Email không hợp lệ';
        }

        if (!formData.password.trim()) {
            errors.password = 'Mật khẩu là bắt buộc';
        } else if (formData.password.length < 6) {
            errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        }

        if (!formData.phone.trim()) {
            errors.phone = 'Số điện thoại là bắt buộc';
        } else if (!/^[0-9]{10,11}$/.test(formData.phone)) {
            errors.phone = 'Số điện thoại không hợp lệ';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (formErrors[name as keyof FormData]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    // Handle form submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const success = await createAccount(formData);

        if (success) {
            toast.success('Tạo tài khoản thành công!');
            navigate('/admin/accounts'); 
        } else {
            toast.error('Tạo tài khoản thất bại');
            console.error('Failed to create account');
        }
    };

    // Handle cancel
    const handleCancel = () => {
        navigate('/admin/accounts');
    };

    return (
        <div className="max-w-full p-6 mx-auto bg-white rounded-lg shadow-lg">
            <h2 className="mb-6 text-2xl font-bold text-gray-800">Tạo Tài Khoản Mới</h2>

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

                {/* Email */}
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

                {/* Mật khẩu */}
                <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                        Mật khẩu *
                    </label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            formErrors.password ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Nhập mật khẩu"
                    />
                    {formErrors.password && (
                        <p className="mt-1 text-sm text-red-500">{formErrors.password}</p>
                    )}
                </div>

                {/* Số điện thoại */}
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

                {/* Trạng thái */}
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

                {/* Buttons */}
                <div className="flex pt-4 space-x-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Đang tạo...' : 'Tạo Tài Khoản'}
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
};

export default CreateAccount;