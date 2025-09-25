import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Logo from "../../../assets/logo.svg";
import { useUserAuth } from '../../../context/UserContext';

const OtpPasswordPage: React.FC = () => {
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const { resetPassword, loading } = useUserAuth();
  const navigate = useNavigate();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || !password) {
      toast.error('Vui lòng nhập mã OTP và mật khẩu mới');
      return;
    }

    try {
      const response = await resetPassword(otp, password);
      toast.success(response.message || 'Đặt lại mật khẩu thành công');
      navigate('/loginClient');
    } catch (error: any) {
      console.error('Reset password error:', error);
      const errorMessage = error?.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại!';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center mb-4">
            <img src={Logo} alt="Logo" className="w-auto h-12" />
          </div>
          <p className="text-gray-600">Nhập mã OTP và mật khẩu mới</p>
        </div>

        <div className="p-8 bg-white shadow-xl rounded-2xl">
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Mã OTP
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full py-3 pl-4 pr-4 transition-all border border-gray-300 rounded-lg outline-none focus:ring-2 focus:[#323232] focus:border-transparent"
                  placeholder="Nhập mã OTP"
                  required
                  disabled={loading}
                />
              </div>
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Mật khẩu mới
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full py-3 pl-4 pr-4 transition-all border border-gray-300 rounded-lg outline-none focus:ring-2 focus:[#323232] focus:border-transparent"
                  placeholder="Nhập mật khẩu mới"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center w-full px-4 py-3 font-medium text-white transition-colors bg-[#323232] hover:[#323232] disabled:cursor-not-allowed"
            >
              {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OtpPasswordPage;