import { useState } from "react";
import { FiPhoneCall, FiMenu, FiX } from "react-icons/fi";
import { Link, Outlet } from "react-router-dom";
import Logo from "../../assets/logo.svg";
import Search from "../../helpers/search";
import { FaFacebook } from "react-icons/fa";
import { FaSquareInstagram } from "react-icons/fa6";
import { FaYoutube } from "react-icons/fa";
import vertify from "../../assets/vertify.webp";
import logo from "../../assets/logo.svg";

function LayoutDefault() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Top Bar - Hidden on mobile */}
      <div className="hidden md:block text-[#323232] bg-white border-b border-gray-200 transition-all duration-300 ease-in-out">
        <div className="flex items-center justify-center px-4 py-3">
          <span className="flex items-center gap-2 text-sm transition-all duration-300 ease-in-out">
            <FiPhoneCall className="w-5 h-5 transition-transform duration-300 ease-in-out hover:rotate-12" />
            <span className="font-bold">Hỗ trợ khách hàng:</span>{" "}
            <span className="text-[#DCB963] font-bold transition-colors duration-300 ease-in-out hover:text-[#B8A157]">
              0986067213
            </span>
          </span>
        </div>
      </div>

      <header className="sticky top-0 z-50 transition-all duration-500 ease-in-out bg-white shadow">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-[72px]">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600 lg:hidden hover:text-gray-900"
            >
              {mobileMenuOpen ? (
                <FiX className="w-6 h-6" />
              ) : (
                <FiMenu className="w-6 h-6" />
              )}
            </button>

            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2 text-white transition-all duration-300 ease-in-out group"
            >
              <img
                src={Logo}
                alt="Logo"
                className="object-contain w-auto h-8 transition-all duration-300 ease-in-out group-hover:brightness-110"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="items-center hidden space-x-2 lg:flex">
              <Link
                to="/"
                className="px-4 py-2.5 text-sm font-medium transition-all duration-300 ease-in-out hover:text-[#DCB963] rounded-lg relative overflow-hidden group"
              >
                <span className="relative z-10">Trang chủ</span>
              </Link>
              <Link
                to="/products"
                className="px-4 py-2.5 text-sm font-medium transition-all duration-300 ease-in-out hover:text-[#DCB963] rounded-lg relative overflow-hidden group"
              >
                <span className="relative z-10">Sản phẩm</span>
              </Link>
              <div className="transition-all duration-300 ease-in-out">
                <Search />
              </div>
            </nav>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden">
            <div className="px-4 py-3 space-y-3 bg-white border-t border-gray-200">
              <Link
                to="/"
                className="block px-4 py-2 text-sm font-medium text-gray-600 hover:text-[#DCB963] hover:bg-gray-50 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Trang chủ
              </Link>
              <Link
                to="/products"
                className="block px-4 py-2 text-sm font-medium text-gray-600 hover:text-[#DCB963] hover:bg-gray-50 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sản phẩm
              </Link>
              
              {/* Mobile Search */}
              <div className="px-4 py-2">
                <Search />
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="transition-all duration-500 ease-in-out">
        <Outlet />
      </main>

      <footer className="px-6 py-12 transition-all duration-500 ease-in-out bg-gray-100">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div className="transition-all duration-300 ease-in-out md:col-span-1 hover:transform">
              <div className="flex items-center mb-4 group">
                <img src={logo} alt="" />
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p className="font-semibold transition-colors duration-300 ease-in-out hover:text-gray-800">
                  CÔNG TY CỔ PHẦN THỜI TRANG KOWIL VIỆT NAM
                </p>
                <p className="transition-colors duration-300 ease-in-out hover:text-[#DCB963]">
                  Hotline: 1900 8079
                </p>
                <p className="transition-colors duration-300 ease-in-out hover:text-gray-800">
                  8:30 - 19:00 tất cả các ngày trong tuần.
                </p>

                <div className="mt-4 space-y-2">
                  <p className="transition-colors duration-300 ease-in-out hover:text-gray-800">
                    <strong>VP Phía Bắc:</strong> Tầng 17 tòa nhà Viwaseen, 48
                    Phố Tô Hiệu, Trung Văn, Nam Từ Liêm, Hà Nội.
                  </p>
                  <p className="transition-colors duration-300 ease-in-out hover:text-gray-800">
                    <strong>VP Phía Nam:</strong> 186A Nam Kỳ Khởi Nghĩa, Phường
                    Võ Thị Sáu, Quận 3, TP.HCM
                  </p>
                </div>
              </div>
            </div>

            <div className="transition-all duration-300 ease-in-out hover:transform">
              <h3 className="mb-4 font-semibold text-gray-900 transition-colors duration-300 ease-in-out hover:text-[#DCB963]">
                GIỚI THIỆU OWEN
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a
                    href="#"
                    className="transition-all duration-300 ease-in-out hover:text-[#DCB963] hover:translate-x-2 hover:font-medium inline-block"
                  >
                    Giới thiệu
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="transition-all duration-300 ease-in-out hover:text-[#DCB963] hover:translate-x-2 hover:font-medium inline-block"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="transition-all duration-300 ease-in-out hover:text-[#DCB963] hover:translate-x-2 hover:font-medium inline-block"
                  >
                    Hệ thống cửa hàng
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="transition-all duration-300 ease-in-out hover:text-[#DCB963] hover:translate-x-2 hover:font-medium inline-block"
                  >
                    Liên hệ với Owen
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="transition-all duration-300 ease-in-out hover:text-[#DCB963] hover:translate-x-2 hover:font-medium inline-block"
                  >
                    Chính sách bảo mật
                  </a>
                </li>
              </ul>
            </div>

            <div className="transition-all duration-300 ease-in-out hover:transform">
              <h3 className="mb-4 font-semibold text-gray-900 transition-colors duration-300 ease-in-out hover:text-[#DCB963]">
                HỖ TRỢ KHÁCH HÀNG
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a
                    href="#"
                    className="transition-all duration-300 ease-in-out hover:text-[#DCB963] hover:translate-x-2 hover:font-medium inline-block"
                  >
                    Hỏi đáp
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="transition-all duration-300 ease-in-out hover:text-[#DCB963] hover:translate-x-2 hover:font-medium inline-block"
                  >
                    Chính sách khách hàng thân thiết
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="transition-all duration-300 ease-in-out hover:text-[#DCB963] hover:translate-x-2 hover:font-medium inline-block"
                  >
                    Chính sách vận chuyển
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="transition-all duration-300 ease-in-out hover:text-[#DCB963] hover:translate-x-2 hover:font-medium inline-block"
                  >
                    Hướng dẫn chọn kích cỡ
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="transition-all duration-300 ease-in-out hover:text-[#DCB963] hover:translate-x-2 hover:font-medium inline-block"
                  >
                    Hướng dẫn thanh toán
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="transition-all duration-300 ease-in-out hover:text-[#DCB963] hover:translate-x-2 hover:font-medium inline-block"
                  >
                    Quy định mua hàng
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="transition-all duration-300 ease-in-out hover:text-[#DCB963] hover:translate-x-2 hover:font-medium inline-block"
                  >
                    Hướng dẫn mua hàng
                  </a>
                </li>
              </ul>
            </div>

            {/* Connect & Payment */}
            <div className="transition-all duration-300 ease-in-out hover:transform">
              <h3 className="mb-4 font-semibold text-gray-900 transition-colors duration-300 ease-in-out hover:text-[#DCB963]">
                KẾT NỐI
              </h3>
              <div className="flex mb-6 space-x-3">
                <a
                  href="#"
                  className="flex items-center justify-center w-8 h-8 transition-all duration-300 ease-in-out bg-gray-800 rounded hover:bg-[#1877f2] hover:scale-110 hover:rotate-12 transform"
                >
                  <FaFacebook className="w-4 h-4 text-white transition-all duration-300 ease-in-out" />
                </a>
                <a
                  href="#"
                  className="flex items-center justify-center w-8 h-8 transition-all duration-300 ease-in-out transform bg-gray-800 rounded hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:scale-110 hover:rotate-12"
                >
                  <FaSquareInstagram className="w-4 h-4 text-white transition-all duration-300 ease-in-out" />
                </a>
                <a
                  href="#"
                  className="flex items-center justify-center w-8 h-8 transition-all duration-300 ease-in-out transform bg-gray-800 rounded hover:bg-red-600 hover:scale-110 hover:rotate-12"
                >
                  <FaYoutube className="w-4 h-4 text-white transition-all duration-300 ease-in-out" />
                </a>
              </div>

              <h3 className="mb-4 font-semibold text-gray-900 transition-colors duration-300 ease-in-out hover:text-[#DCB963]">
                PHƯƠNG THỨC THANH TOÁN
              </h3>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="p-2 text-xs font-medium text-center bg-white border rounded transition-all duration-300 ease-in-out hover:bg-[#DCB963] hover:text-white hover:scale-105 hover:shadow-md cursor-pointer">
                  ATM
                </div>
                <div className="p-2 text-xs font-medium text-center bg-white border rounded transition-all duration-300 ease-in-out hover:bg-[#DCB963] hover:text-white hover:scale-105 hover:shadow-md cursor-pointer">
                  VISA
                </div>
                <div className="p-2 text-xs font-medium text-center bg-white border rounded transition-all duration-300 ease-in-out hover:bg-[#DCB963] hover:text-white hover:scale-105 hover:shadow-md cursor-pointer">
                  MASTER
                </div>
                <div className="p-2 text-xs font-medium text-center bg-white border rounded transition-all duration-300 ease-in-out hover:bg-[#DCB963] hover:text-white hover:scale-105 hover:shadow-md cursor-pointer">
                  JCB
                </div>
              </div>

              <div className="mt-4">
                <div>
                  <img src={vertify} alt="" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 mt-8 text-center transition-all duration-300 ease-in-out border-t border-gray-200">
          <p className="text-sm text-gray-600 transition-colors duration-300 ease-in-out hover:text-gray-800">
            © 2020 by Kowil Fashion - Phú Thái Holdings
          </p>
        </div>
      </footer>
    </>
  );
}

export default LayoutDefault;
