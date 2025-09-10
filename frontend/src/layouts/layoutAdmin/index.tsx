import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, Users, Settings, Home, User, ChevronLeft } from "lucide-react";
import logo from "../../assets/logo.svg";
import { IoBagAdd } from "react-icons/io5";
import { Outlet } from "react-router-dom";
import { BiSolidCategoryAlt } from "react-icons/bi";
import { RiAccountCircleFill } from "react-icons/ri";
import { HiUserGroup } from "react-icons/hi";
import { FaAddressCard } from "react-icons/fa";
import { FaFolder } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext"; 

function LayoutAdmin() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout, hasPermission } = useAuth(); // Use the useAuth hook
  console.log("LayoutAdmin user:", user); // Add this line

  const handleLogout = () => {
    logout(); // Use the logout function from context
    window.location.href = "/admin/login";
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-white shadow-lg transition-all duration-300 relative flex flex-col`}
      >
        <Link to="/admin/dashboard">
          <div className="flex items-center justify-center p-4 border-b">
            {sidebarOpen && <img src={logo} alt="logo" className="w-16 h-16" />}
          </div>
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute p-2 text-gray-600 transition-colors rounded-full right-6 hover:bg-gray-200 "
        >
          {sidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
        </button>
        <nav className="flex-grow px-4 mt-4">
          <Link
            to="/admin/dashboard"
            className="flex items-center gap-4 p-3 mb-2 text-gray-700 transition-all rounded-lg hover:bg-gray-100 hover:text-blue-600 group"
          >
            <div className="flex items-center justify-center w-6 h-6">
              <Home className="w-5 h-5" />
            </div>
            {sidebarOpen && (
              <span className="transition-opacity duration-300">Dashboard</span>
            )}
          </Link>
          <Link
            to="/admin/users"
            className="flex items-center gap-4 p-3 mb-2 text-gray-700 transition-all rounded-lg hover:bg-gray-100 hover:text-blue-600 group"
          >
            <div className="flex items-center justify-center w-6 h-6">
              <Users className="w-5 h-5" />
            </div>
            {sidebarOpen && (
              <span className="transition-opacity duration-300">
                Người dùng
              </span>
            )}
          </Link>
          <Link
            to="/admin/products"
            className="flex items-center gap-4 p-3 mb-2 text-gray-700 transition-all rounded-lg hover:bg-gray-100 hover:text-blue-600 group"
          >
            <div className="flex items-center justify-center w-6 h-6">
              <IoBagAdd className="w-5 h-5" />
            </div>
            {sidebarOpen && (
              <span className="transition-opacity duration-300">Sản phẩm</span>
            )}
          </Link>
          <Link
            to="/admin/category"
            className="flex items-center gap-4 p-3 mb-2 text-gray-700 transition-all rounded-lg hover:bg-gray-100 hover:text-blue-600 group"
          >
            <div className="flex items-center justify-center w-6 h-6">
              <BiSolidCategoryAlt className="w-5 h-5" />
            </div>
            {sidebarOpen && (
              <span className="transition-opacity duration-300">Danh mục</span>
            )}
          </Link>
          {hasPermission("accounts_view") && ( // Use hasPermission
            <Link
              to="/admin/accounts"
              className="flex items-center gap-4 p-3 mb-2 text-gray-700 transition-all rounded-lg hover:bg-gray-100 hover:text-blue-600 group"
            >
              <div className="flex items-center justify-center w-6 h-6">
                <RiAccountCircleFill className="w-5 h-5" />
              </div>
              {sidebarOpen && (
                <span className="transition-opacity duration-300">
                  Tài khoản
                </span>
              )}
            </Link>
          )}
            {hasPermission("orders_view") && ( // Example for orders
              
            <Link
              to="/admin/orders"
              className="flex items-center gap-4 p-3 mb-2 text-gray-700 transition-all rounded-lg hover:bg-gray-100 hover:text-blue-600 group"
            >
              <FaFolder className="w-5 h-5" />
              {sidebarOpen && (
                <span className="transition-opacity duration-300">
                  Đơn hàng
                </span>
              )}
            </Link>
            )}
          
          {hasPermission("roles_view") && ( // Example for roles
            <Link
              to="/admin/roles"
              className="flex items-center gap-4 p-3 mb-2 text-gray-700 transition-all rounded-lg hover:bg-gray-100 hover:text-blue-600 group"
            >
              <HiUserGroup className="w-5 h-5" />
              {sidebarOpen && (
                <span className="transition-opacity duration-300">Quyền</span>
              )}
            </Link>
          )}
          {hasPermission("roles_permissions") && ( // Example for permissions
            <Link
              to="/admin/permissions"
              className="flex items-center gap-4 p-3 mb-2 text-gray-700 transition-all rounded-lg hover:bg-gray-100 hover:text-blue-600 group"
            >
              <FaAddressCard className="w-5 h-5" />
              {sidebarOpen && (
                <span className="transition-opacity duration-300">
                  Phân quyền
                </span>
              )}
            </Link>
          )}
          <Link
            to="/admin/settings"
            className="flex items-center gap-4 p-3 mb-2 text-gray-700 transition-all rounded-lg hover:bg-gray-100 hover:text-blue-600 group"
          >
            <div className="flex items-center justify-center w-6 h-6">
              <Settings className="w-5 h-5" />
            </div>
            {sidebarOpen && (
              <span className="transition-opacity duration-300">Cài đặt</span>
            )}
          </Link>
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center">
            {sidebarOpen ? (
              <div className="flex items-center w-full gap-3">
                <User className="w-8 h-8 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">
                    {user?.username || "Admin User"}
                  </p>{" "}
                  {/* Display username from context */}
                  <p>{user?.role?.title}</p>
                  <button
                    onClick={handleLogout}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Đăng xuất
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center w-full">
                <User className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-grow p-6 overflow-auto bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <Outlet />
      </div>
    </div>
  );
}

export default LayoutAdmin;
