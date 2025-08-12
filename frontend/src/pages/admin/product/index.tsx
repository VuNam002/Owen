import { use, useEffect, useState } from "react";

interface Product {
  _id: string;
  position: number;
  title: string;
  img: string;
  price: number;
  category: string;
  status: string;
  createdBy: {
    _id: string;
    name: string;
}}

interface ApiResponse {
  data: Product[];
}

function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [keyword, setKeyword] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('position');
  const [sortOrder, setSortOrder] = useState<string>('asc');
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [positions, setPositions] = useState<{ [key: string]: number }>({});
  //Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);

  const API_BASE = 'http://localhost:3000/api/v1/products';
  
  const apiRequest = async (url: string, options: RequestInit = {}): Promise<ApiResponse> => {
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });
    if(!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  }

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await apiRequest(API_BASE);
        setProducts(result.data);
        const initialPositions: { [key: string]: number } = {};
        result.data.forEach((product: Product) => {
          initialPositions[product._id] = product.position;
        });
      } catch (error: any) {
        setError('Không thể tải dữ liệu sản phẩm');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);
  
  const filteredProducts = products
    .filter((product: Product) => {
      const matchesStatus = !filterStatus || product.status === filterStatus;
      const matchesKeyword = !keyword || product.title.toLowerCase().includes(keyword.toLowerCase());
      return matchesStatus && matchesKeyword;
    })
    .sort((a: Product, b: Product) => {
      const getValue = (product: Product, field: string) => {
        switch(field) {
          case 'title': return product.title.toLowerCase();
          case 'price': return product.price;
          case 'position': return positions[product._id] ?? product.position;
          case 'createdAt': return new Date(product.createdBy?.createdAt || product.createdAt);
          default: return positions[product._id] ?? product.position;
        }
      }
    });

    //Pagation
    const totalItems = filteredProducts.length;
    const totalPages = Math.ceil(totalItems/itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    useEffect(() => {
      setCurrentPage(1);
      setSelectedProducts([]);
      setSelectAll(false);
    }, [filterStatus, keyword, sortBy, sortOrder])

  // Component render logic here
  return (
    <div>
      <div className="min-h-screen p-6 bg-gray-50">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Danh sách sản phẩm</h1>
            <p className="mt-1 text-gray-600">Quản lý sản phẩm của cửa hàng</p>
          </div>

          <div className="mb-6 bg-white border border-gray-200 rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2></h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Products;