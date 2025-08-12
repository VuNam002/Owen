import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, Users, Settings, Home, User } from "lucide-react";
import logo from "../../assets/logo.svg";
import { IoBagAdd } from "react-icons/io5";

function LayoutAdmin() {
  const [sidebarOpen, setSidebarOpen] = useState(true);



  return (
    <div className="flex min-h-screen bg-gray-100">
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-16"
        } bg-white shadow-lg transition-all duration-300`}
      >
        <div className="p-4 border-b">
          <div className="flex items-center justify-center">
            {sidebarOpen && (
              <span className="font-semibold">
                <img src={logo} alt="logo" className="w-[65px] h-[65px]" />
              </span>
            )}
          </div>
        </div>

        <div className="p-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center justify-center w-full p-2 rounded hover:bg-gray-100"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <nav className="px-4">
          <Link
            to="/admin/dashboard"
            className="flex items-center w-full gap-3 p-3 mb-2 text-gray-700 transition-colors rounded hover:bg-gray-100 hover:text-blue-600"
          >
            <span><Home /></span> 
            {sidebarOpen && <span>Dashboard</span>}
          </Link>
          
          <Link
            to="/admin/users"
            className="flex items-center w-full gap-3 p-3 mb-2 text-gray-700 transition-colors rounded hover:bg-gray-100 hover:text-blue-600"
          >
            <span><Users /></span> 
            {sidebarOpen && <span>Người dùng</span>}
          </Link>
          
          <Link
            to="/admin/products"
            className="flex items-center w-full gap-3 p-3 mb-2 text-gray-700 transition-colors rounded hover:bg-gray-100 hover:text-blue-600"
          >
            <span><IoBagAdd /></span> 
            {sidebarOpen && <span>Sản phẩm</span>}
          </Link>
          
          <Link
            to="/admin/settings"
            className="flex items-center w-full gap-3 p-3 mb-2 text-gray-700 transition-colors rounded hover:bg-gray-100 hover:text-blue-600"
          >
            <span><Settings /></span> 
            {sidebarOpen && <span>Cài đặt</span>}
          </Link>
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t">
          <div className="flex items-center">
            <User className="w-8 h-8 text-gray-400" />
            {sidebarOpen && (
              <div className="ml-3">
                <p className="text-sm font-medium">Admin User</p>
                <button className="text-xs text-red-600 hover:underline">
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 p-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-800">
          Admin Dashboard
        </h1>
        <div className="p-6 bg-white rounded-lg shadow">
          <p className="text-gray-600">Nội dung trang admin sẽ hiển thị ở đây</p>
        </div>
      </div>
    </div>
  );
}

export default LayoutAdmin;