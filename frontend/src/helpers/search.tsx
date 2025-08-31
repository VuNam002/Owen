import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";

function HeaderSearch() {
  const [keyword, setKeyword] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedKeyword = keyword.trim();
    
    if (trimmedKeyword && trimmedKeyword.length >= 2) {
      navigate(`/search?keyword=${encodeURIComponent(trimmedKeyword)}`);
      setKeyword("");
    }
  };

  return (
    <div className="relative w-64">
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Tìm kiếm sản phẩm..."
          aria-label="Tìm kiếm sản phẩm"
          className="w-full py-2 pl-4 pr-10 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
        />
        <button
          type="submit"
          className="absolute top-0 right-0 flex items-center justify-center h-full px-3 text-gray-500 transition-colors duration-200 rounded-r-md hover:text-gray-700"
          aria-label="Tìm kiếm"
          disabled={keyword.trim().length < 2}
        >
          <FaSearch />
        </button>
      </form>
    </div>
  );
}

export default HeaderSearch;