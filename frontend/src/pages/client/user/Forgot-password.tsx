import React, { useState } from 'react';
import { Mail, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Logo from "../../../assets/logo.svg";
import { useUserAuth } from '../../../context/UserContext';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const { forgotPassword, loading } = useUserAuth(); 
  const navigate = useNavigate();

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Vui lòng nhập địa chỉ email của bạn');
      return;
    }

    try {
      const response = await forgotPassword(email);
      toast.success(response.message || 'Mã OTP đã gửi đến email của bạn');
      navigate('/otp-password', { state: { email } });

    } catch (error: any) {
      console.error('Forgot password error:', error);
      const errorMessage = error?.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại!';
      toast.error(errorMessage);
    }
  };

  const handleLogin = () => {
    navigate('/loginClient');
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md">
        {/* Logo and Brand */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center mb-4">
            <img src={Logo} alt="Logo" className="w-auto h-12" />
          </div>
          <p className="text-gray-600">Đặt lại mật khẩu của bạn</p>
        </div>

        <div className="p-8 bg-white shadow-xl rounded-2xl">
          <form onSubmit={handleForgotPassword} className="space-y-6">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full py-3 pl-12 pr-4 transition-all border border-gray-300 rounded-lg outline-none focus:ring-2 focus:[#323232] focus:border-transparent"
                  placeholder="Nhập địa chỉ email của bạn"
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
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Đang gửi yêu cầu...
                </>
              ) : (
                'Gửi yêu cầu đặt lại'
              )}
            </button>
          </form>

          <p className="mt-6 text-sm text-center text-gray-600">
            Nhớ mật khẩu của bạn?{' '}
            <button
              type="button"
              onClick={handleLogin}
              className="font-medium text-[#323232] disabled:cursor-not-allowed"
              disabled={loading}
            >
              Đăng nhập
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;