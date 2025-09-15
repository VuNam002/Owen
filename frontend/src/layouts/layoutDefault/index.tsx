import { useState, useEffect } from "react";
import { FiPhoneCall, FiMenu, FiX, FiChevronDown } from "react-icons/fi";
import { Link, Outlet } from "react-router-dom";
import Logo from "../../assets/logo.svg";
import Search from "../../helpers/search";
import { FaFacebook, FaYoutube, FaCartPlus } from "react-icons/fa";
import { FaSquareInstagram } from "react-icons/fa6";
import vertify from "../../assets/vertify.webp";
import logo from "../../assets/logo.svg";
import pay from "../../assets/pay.webp"

interface Category {
  _id: string;
  title: string;
  parent_id: string | null;
  status: string;
  children?: Category[];
}

function LayoutDefault() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]); 
  const [allCategories, setAllCategories] = useState<Category[]>([]); 
  const [openCategory, setOpenCategory] = useState<string | null>(null); 
  const [openMobileCategory, setOpenMobileCategory] = useState<string | null>(null); 

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/v1/categorys');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          console.log("API Result Data:", result.data); 
          setAllCategories(result.data); 
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (allCategories.length > 0) {
      const buildCategoryTree = (categories: Category[], currentParentId: string | null = null): Category[] => {
        return categories
          .filter(category => {
            if (currentParentId === null) {
              return category.status === 'active' && category.title && (category.parent_id === '' || category.parent_id === null);
            } else {
              const parentCategory = allCategories.find(p => p._id === currentParentId);
              return category.status === 'active' && category.title && category.parent_id === parentCategory?.title;
            }
          })
          .map(category => ({
            ...category,
            children: buildCategoryTree(categories, category._id)
          }));
      };

      const nested = buildCategoryTree(allCategories, null); 
      console.log("Nested Categories (after build):", nested); 
      setCategories(nested); 
    }
  }, [allCategories]);

  return (
    <>
      {/* Header hỗ trợ khách hàng */}
      <div className="hidden md:block text-[#323232] bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 transition-all duration-300 ease-in-out">
        <div className="flex items-center justify-center px-4 py-3">
          <span className="flex items-center gap-2 text-sm transition-all duration-300 ease-in-out">
            <FiPhoneCall className="w-5 h-5 text-[#DCB963] transition-transform duration-300 ease-in-out hover:rotate-12" />
            <span className="font-semibold text-gray-700">Hỗ trợ khách hàng:</span>
            <span className="text-[#DCB963] font-bold transition-colors duration-300 ease-in-out hover:text-[#B8A157] hover:underline cursor-pointer">
              0986067213
            </span>
          </span>
        </div>
      </div>

      <header className="sticky top-0 z-50 transition-all duration-500 ease-in-out bg-white border-b border-gray-100 shadow-lg">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-[80px]">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600 transition-all duration-200 rounded-lg lg:hidden hover:text-gray-900 hover:bg-gray-100"
            >
              {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
            <Link to="/" className="flex items-center gap-2 text-white transition-all duration-300 ease-in-out group">
              <img 
                src={Logo} 
                alt="Logo" 
                className="object-contain w-auto h-10 transition-all duration-300 ease-in-out " 
              />
            </Link>

            <nav className="items-center hidden space-x-0 lg:flex">
              <div className="transition-all duration-300 ease-in-out ">
                <Search />
              </div>
              {categories.map((category) => (
                <div
                  key={category._id}
                  className="relative group"
                  onMouseEnter={() => setOpenCategory(category._id)}
                  onMouseLeave={() => setOpenCategory(null)}
                >
                  {category.children && category.children.length > 0 ? (
                    <div className="flex items-center gap-1 px-4 py-3 text-[15px] font-medium text-gray-700 transition-all duration-300 ease-in-out hover:text-[#DCB963] rounded-lg cursor-pointer relative group">
                      <span className="relative z-10">{category.title}</span>
                      <FiChevronDown className="w-4 h-4 transition-transform duration-300 " />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#DCB963]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                    </div>
                  ) : (
                    <Link
                      to={`/category/${category._id}`}
                      className="flex items-center gap-1 px-4 py-3 text-[15px] font-medium text-gray-700 transition-all duration-300 ease-in-out hover:text-[#DCB963]  rounded-lg relative group"
                    >
                      <span className="relative z-10">{category.title}</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#DCB963]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                    </Link>
                  )}
                  
                  {/* Dropdown menu */}
                  {category.children && category.children.length > 0 && openCategory === category._id && (
                    <div className="absolute left-0 z-20 w-56 py-2 mt-1 transition-all duration-300 ease-in-out transform scale-100 bg-white border border-gray-100 shadow-xl opacity-100 rounded-xl">
                      {/* Dropdown arrow */}
                      <div className="absolute w-4 h-4 rotate-45 bg-white border-t border-l border-gray-100 -top-2 left-6"></div>
                      
                      {category.children.map((child, index) => (
                        <Link
                          key={child._id}
                          to={`/category/${child._id}`}
                          className={`block px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-[#DCB963]/10 hover:to-transparent hover:text-[#DCB963] transition-all duration-200 relative group ${
                            index === 0 ? 'rounded-t-xl' : ''
                          } ${
                            index === category.children.length - 1 ? 'rounded-b-xl' : ''
                          }`}
                          onClick={() => setOpenCategory(null)}
                        >
                          <span className="flex items-center justify-between">
                            {child.title}
                            <span className="w-0 group-hover:w-2 h-0.5 bg-[#DCB963] transition-all duration-300 rounded-full"></span>
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Cart */}
              <Link 
                to="/cart" 
                className="flex items-center justify-center w-12 h-12 text-gray-700 transition-all duration-300 ease-in-out hover:text-[#DCB963]  rounded-lg relative group ml-2"
              >
                <FaCartPlus className="w-5 h-5" />
                <div className="absolute inset-0 transition-opacity duration-300 rounded-lg opacity-0 bg-gradient-to-r to-transparent group-hover:opacity-100"></div>
              </Link>
            </nav>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="bg-white border-t border-gray-100 shadow-lg lg:hidden">
            <div className="px-4 py-4 space-y-1 overflow-y-auto max-h-96">
              {/* Home link */}
              <Link 
                to="/" 
                className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:text-[#DCB963] hover:bg-gray-50 rounded-lg transition-all duration-200" 
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>Trang chủ</span>
              </Link>

              {/* Dynamic Categories for Mobile */}
              {categories.map(category => (
                <div key={category._id} className="border-b border-gray-50 last:border-b-0">
                  <div
                    className="flex justify-between items-center px-4 py-3 text-sm font-medium text-gray-700 hover:text-[#DCB963] hover:bg-gray-50 rounded-lg cursor-pointer transition-all duration-200"
                    onClick={() => {
                      if (category.children && category.children.length > 0) {
                        setOpenMobileCategory(openMobileCategory === category._id ? null : category._id);
                      } else {
                        setMobileMenuOpen(false);
                      }
                    }}
                  >
                    {category.children && category.children.length > 0 ? (
                      <span className="flex-1">{category.title}</span>
                    ) : (
                      <Link 
                        to={`/category/${category._id}`} 
                        onClick={() => setMobileMenuOpen(false)} 
                        className="flex-1"
                      >
                        {category.title}
                      </Link>
                    )}
                    {category.children && category.children.length > 0 && (
                      <FiChevronDown className={`w-4 h-4 transition-transform duration-300 ${
                        openMobileCategory === category._id ? 'rotate-180 text-[#DCB963]' : ''
                      }`} />
                    )}
                  </div>
                  
                  {/* Subcategories */}
                  {category.children && category.children.length > 0 && openMobileCategory === category._id && (
                    <div className="pl-6 ml-4 border-l-2 border-[#DCB963]/20 bg-gray-50/50 rounded-r-lg">
                      {category.children.map(child => (
                        <Link
                          key={child._id}
                          to={`/category/${child._id}`}
                          className="flex items-center px-4 py-3 text-sm text-gray-600 hover:text-[#DCB963] hover:bg-white rounded-lg transition-all duration-200 relative"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <span className="w-2 h-2 bg-[#DCB963]/30 rounded-full mr-3"></span>
                          {child.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Cart for mobile */}
              <Link 
                to="/cart" 
                className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:text-[#DCB963] hover:bg-gray-50 rounded-lg transition-all duration-200" 
                onClick={() => setMobileMenuOpen(false)}
              >
                <FaCartPlus className="w-4 h-4 mr-2" />
                <span>Giỏ hàng</span>
              </Link>

              {/* Search for mobile */}
              <div className="px-4 py-3 rounded-lg bg-gray-50">
                <Search />
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="transition-all duration-500 ease-in-out">
        <Outlet />
      </main>

      {/* Footer giữ nguyên */}
      <footer className="px-6 py-12 transition-all duration-500 ease-in-out bg-gray-100">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div className="transition-all duration-300 ease-in-out md:col-span-1 hover:transform">
              <div className="flex items-center mb-4 group"><img src={logo} alt="" /></div>
              <div className="space-y-2 text-sm text-gray-600">
                <p className="font-semibold transition-colors duration-300 ease-in-out hover:text-gray-800">CÔNG TY CỔ PHẦN THỜI TRANG KOWIL VIỆT NAM</p>
                <p className="transition-colors duration-300 ease-in-out hover:text-[#DCB963]">Hotline: 1900 8079</p>
                <p className="transition-colors duration-300 ease-in-out hover:text-gray-800">8:30 - 19:00 tất cả các ngày trong tuần.</p>
                <div className="mt-4 space-y-2">
                  <p className="transition-colors duration-300 ease-in-out hover:text-gray-800"><strong>VP Phía Bắc:</strong> Tầng 17 tòa nhà Viwaseen, 48 Phố Tô Hiệu, Trung Văn, Nam Từ Liêm, Hà Nội.</p>
                  <p className="transition-colors duration-300 ease-in-out hover:text-gray-800"><strong>VP Phía Nam:</strong> 186A Nam Kỳ Khởi Nghĩa, Phường Võ Thị Sáu, Quận 3, TP.HCM</p>
                </div>
              </div>
            </div>
            <div className="transition-all duration-300 ease-in-out hover:transform">
              <h3 className="mb-4 font-semibold text-gray-900 transition-colors duration-300 ease-in-out hover:text-[#DCB963]">GIỚI THIỆU OWEN</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="transition-all duration-300 ease-in-out hover:text-[#DCB963] hover:translate-x-2 hover:font-medium inline-block">Giới thiệu</a></li>
                <li><a href="#" className="transition-all duration-300 ease-in-out hover:text-[#DCB963] hover:translate-x-2 hover:font-medium inline-block">Blog</a></li>
                <li><a href="#" className="transition-all duration-300 ease-in-out hover:text-[#DCB963] hover:translate-x-2 hover:font-medium inline-block">Hệ thống cửa hàng</a></li>
                <li><a href="#" className="transition-all duration-300 ease-in-out hover:text-[#DCB963] hover:translate-x-2 hover:font-medium inline-block">Liên hệ với Owen</a></li>
                <li><a href="#" className="transition-all duration-300 ease-in-out hover:text-[#DCB963] hover:translate-x-2 hover:font-medium inline-block">Chính sách bảo mật</a></li>
              </ul>
            </div>
            <div className="transition-all duration-300 ease-in-out hover:transform">
              <h3 className="mb-4 font-semibold text-gray-900 transition-colors duration-300 ease-in-out hover:text-[#DCB963]">HỖ TRỢ KHÁCH HÀNG</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="transition-all duration-300 ease-in-out hover:text-[#DCB963] hover:translate-x-2 hover:font-medium inline-block">Hỏi đáp</a></li>
                <li><a href="#" className="transition-all duration-300 ease-in-out hover:text-[#DCB963] hover:translate-x-2 hover:font-medium inline-block">Chính sách khách hàng thân thiết</a></li>
                <li><a href="#" className="transition-all duration-300 ease-in-out hover:text-[#DCB963] hover:translate-x-2 hover:font-medium inline-block">Chính sách vận chuyển</a></li>
                <li><a href="#" className="transition-all duration-300 ease-in-out hover:text-[#DCB963] hover:translate-x-2 hover:font-medium inline-block">Hướng dẫn chọn kích cỡ</a></li>
                <li><a href="#" className="transition-all duration-300 ease-in-out hover:text-[#DCB963] hover:translate-x-2 hover:font-medium inline-block">Hướng dẫn thanh toán</a></li>
                <li><a href="#" className="transition-all duration-300 ease-in-out hover:text-[#DCB963] hover:translate-x-2 hover:font-medium inline-block">Quy định mua hàng</a></li>
                <li><a href="#" className="transition-all duration-300 ease-in-out hover:text-[#DCB963] hover:translate-x-2 hover:font-medium inline-block">Hướng dẫn mua hàng</a></li>
              </ul>
            </div>
            <div className="transition-all duration-300 ease-in-out hover:transform">
              <h3 className="mb-4 font-semibold text-gray-900 transition-colors duration-300 ease-in-out hover:text-[#DCB963]">KẾT NỐI</h3>
              <div className="flex mb-6 space-x-3">
                <a href="#" className="flex items-center justify-center w-8 h-8 transition-all duration-300 ease-in-out bg-gray-800 rounded hover:bg-[#1877f2] hover:scale-110 hover:rotate-12 transform"><FaFacebook className="w-4 h-4 text-white transition-all duration-300 ease-in-out" /></a>
                <a href="#" className="flex items-center justify-center w-8 h-8 transition-all duration-300 ease-in-out transform bg-gray-800 rounded hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:scale-110 hover:rotate-12"><FaSquareInstagram className="w-4 h-4 text-white transition-all duration-300 ease-in-out" /></a>
                <a href="#" className="flex items-center justify-center w-8 h-8 transition-all duration-300 ease-in-out transform bg-gray-800 rounded hover:bg-red-600 hover:scale-110 hover:rotate-12"><FaYoutube className="w-4 h-4 text-white transition-all duration-300 ease-in-out" /></a>
              </div>
              <h3 className="mb-4 font-semibold text-gray-900 transition-colors duration-300 ease-in-out hover:text-[#DCB963]">PHƯƠNG THỨC THANH TOÁN</h3>
              <div className="grid w-[500px] grid-cols-2 gap-2 mb-4">
                <img className="w-[213px] h-auto" src={pay} alt="thanh toán" />
              </div>
              <div className="mt-4"><div><img src={vertify} alt="xác thực" /></div></div>
            </div>
          </div>
        </div>
        <div className="pt-6 mt-8 text-center transition-all duration-300 ease-in-out border-t border-gray-200">
          <p className="text-sm text-gray-600 transition-colors duration-300 ease-in-out hover:text-gray-800">© 2025 by Kowil Fashion - Vũ Nam Holdings</p>
        </div>
      </footer>
    </>
  );
}

export default LayoutDefault;