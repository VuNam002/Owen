import { FiPhoneCall } from "react-icons/fi";
import { Link, Outlet } from "react-router-dom";
import Logo from "../../assets/logo.svg";
import Search from "../../helpers/search"

function LayoutDefault() {
  return (
    <>
      <div className="text-[#323232] bg-white border-b border-gray-200">
        <div className="flex items-center justify-center px-4 py-3">
          <span className="flex items-center gap-2 text-sm">
            <FiPhoneCall className="w-5 h-5" />
            <span className="font-bold">Hỗ trợ khách hàng:</span>{" "}
            <span className="text-[#DCB963] font-bold">0986067213</span>
          </span>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-[72px]">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 text-white">
              <img
                src={Logo}
                alt="Logo"
                className="object-contain w-auto h-8"
              />
            </Link>
            {/* Menu */}
            <nav className="items-center hidden space-x-2 lg:flex">
              <Link
                to="/"
                className="px-4 py-2.5 text-sm font-medium hover:text-[#DCB963]"
              >
                {" "}
                Trang chủ
              </Link>
              {/* Trang sản phẩm */}
              <Link
                to="/products"
                className="px-4 py-2.5 text-sm font-medium hover:text-[#DCB963]"
              >
                {" "}
                Sản phẩm
              </Link>
              <Search/>
            </nav>
          </div>
        </div>
      </header>

      {/* Nội dung trang */}
      <main>
        <Outlet />
      </main>

      <footer className=""></footer>
    </>
  );
}

export default LayoutDefault;
