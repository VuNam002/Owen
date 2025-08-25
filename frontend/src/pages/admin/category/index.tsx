import { useState, useMemo } from "react";
import { useCategorys } from "../../../hooks/useCategory";
import { CategoryFilters } from "../../../components/Category/CategoryFillers";
import { CategoryActions } from "../../../components/Category/CategoryAction";
import { ErrorAlert } from "../../../components/ErrorAlert/ErrorAlert";

interface CategoryWithLevel {
  _id: string;
  title: string;
  description?: string;
  status: string;
  parent_id?: string;
  thumbnail?: string;
  createdBy?: { name: string };
  createdAt?: string;
  level: number;
  children: CategoryWithLevel[];
  hasChildren: boolean;
  isExpanded?: boolean;
}

function Category() {
  const {
    loading, error, setError, categorys, keyword, setKeyword, filterStatus, setFilterStatus,
    sortBy, setSortBy, sortOrder, setSortOrder, selectedCategorys, selectAll,
    handleSelectCategory, handleSelectAll, handleStatusChange, handleBulkDelete, handleDelete
  } = useCategorys();

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const CLOUDINARY_CLOUD_NAME = "your-cloud-name";

  // Utility functions
  const buildCloudinaryUrl = (publicId?: string, w = 40, h = 40) => {
    if (!publicId?.trim() || publicId.includes('cloudinary.com') || publicId.includes('http')) return publicId;
    const cleanId = publicId.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '');
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/c_fill,w_${w},h_${h},q_auto,f_auto/${cleanId}`;
  };

  const getPlaceholder = (size = 40) => `data:image/svg+xml;base64,${btoa(`
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="#F3F4F6"/>
      <path d="M${size/2} ${size*0.65}C${size*0.225} ${size*0.65} ${size*0.225} ${size*0.35} ${size/2} ${size*0.35}S${size*0.775} ${size*0.65} ${size/2} ${size*0.65}Z" fill="#9CA3AF"/>
      <circle cx="${size/2}" cy="${size*0.45}" r="${size*0.08}" fill="#9CA3AF"/>
    </svg>
  `)}`;

  const SafeImage = ({ src, alt, className, width = 40, height = 40 }: any) => {
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);
    const cloudinaryUrl = buildCloudinaryUrl(src, width, height);
    const finalSrc = error || !cloudinaryUrl ? getPlaceholder(width) : cloudinaryUrl;

    return (
      <div className="relative">
        <img className={className} src={finalSrc} alt={alt} 
             onLoad={() => setLoading(false)} onError={() => { setError(true); setLoading(false); }} />
        {loading && !error && cloudinaryUrl && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded-lg animate-pulse">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>
    );
  };

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedCategories);
    newExpanded.has(id) ? newExpanded.delete(id) : newExpanded.add(id);
    setExpandedCategories(newExpanded);
  };

  // Filter and sort categories
  const filteredCategories = useMemo(() => {
    if (!Array.isArray(categorys)) return [];
    let filtered = [...categorys];

    if (keyword?.trim()) {
      const search = keyword.toLowerCase().trim();
      filtered = filtered.filter(c => 
        c.title?.toLowerCase().includes(search) || 
        c.description?.toLowerCase().includes(search) || 
        c.parent_id?.toLowerCase().includes(search)
      );
    }

    if (filterStatus && filterStatus !== 'all') {
      filtered = filtered.filter(c => {
        const status = c.status?.toLowerCase().trim();
        return filterStatus === 'active' 
          ? status === 'active' || status === 'hoạt động'
          : status !== 'active' && status !== 'hoạt động';
      });
    }

    if (sortBy) {
      filtered.sort((a, b) => {
        let aVal: any, bVal: any;
        switch (sortBy) {
          case 'title': [aVal, bVal] = [a.title || '', b.title || '']; break;
          case 'status': [aVal, bVal] = [a.status || '', b.status || '']; break;
          case 'createdAt': [aVal, bVal] = [new Date(a.createdAt || 0), new Date(b.createdAt || 0)]; break;
          case 'createdBy': [aVal, bVal] = [a.createdBy?.name || '', b.createdBy?.name || '']; break;
          default: return 0;
        }
        
        if (sortBy === 'createdAt') {
          return sortOrder === 'desc' ? bVal.getTime() - aVal.getTime() : aVal.getTime() - bVal.getTime();
        }
        const comparison = aVal.toString().localeCompare(bVal.toString(), 'vi', { numeric: true });
        return sortOrder === 'desc' ? -comparison : comparison;
      });
    }

    return filtered;
  }, [categorys, keyword, filterStatus, sortBy, sortOrder]);

  // Build category tree
  const buildCategoryTree = (categories: any[]): CategoryWithLevel[] => {
    const categoryMap = new Map<string, CategoryWithLevel>();
    const titleMap = new Map<string, CategoryWithLevel>();
    
    categories.forEach(category => {
      const categoryWithLevel = {
        ...category, level: 0, children: [], hasChildren: false,
        isExpanded: expandedCategories.has(category._id)
      };
      categoryMap.set(category._id, categoryWithLevel);
      titleMap.set(category.title, categoryWithLevel);
    });

    const rootCategories: CategoryWithLevel[] = [];

    categoryMap.forEach(category => {
      if (!category.parent_id?.trim()) {
        category.level = 0;
        rootCategories.push(category);
      } else {
        const parent = titleMap.get(category.parent_id);
        if (parent) {
          category.level = parent.level + 1;
          parent.children.push(category);
          parent.hasChildren = true;
        } else {
          category.level = 0;
          rootCategories.push(category);
        }
      }
    });

    return rootCategories;
  };

  const flattenTree = (tree: CategoryWithLevel[]): CategoryWithLevel[] => {
    const result: CategoryWithLevel[] = [];
    const traverse = (nodes: CategoryWithLevel[]) => {
      nodes.forEach(node => {
        result.push(node);
        if (node.hasChildren && expandedCategories.has(node._id)) {
          traverse([...node.children].sort((a, b) => a.title.localeCompare(b.title)));
        }
      });
    };
    traverse([...tree].sort((a, b) => a.title.localeCompare(b.title)));
    return result;
  };

  const categoryTree = useMemo(() => buildCategoryTree(filteredCategories), [filteredCategories, expandedCategories]);
  const displayCategories = useMemo(() => flattenTree(categoryTree), [categoryTree, expandedCategories]);

  const findCategoryByTitle = (categories: CategoryWithLevel[], title: string): CategoryWithLevel | null => {
    for (const cat of categories) {
      if (cat.title === title) return cat;
      const found = findCategoryByTitle(cat.children, title);
      if (found) return found;
    }
    return null;
  };

  const getCategoryPath = (category: CategoryWithLevel): string[] => {
    const path = [category.title];
    if (category.parent_id?.trim()) {
      const parent = findCategoryByTitle(categoryTree, category.parent_id);
      if (parent) return [...getCategoryPath(parent), category.title];
    }
    return path;
  };

  // Render functions
  const renderCategoryName = (category: CategoryWithLevel) => (
    <div className="flex items-center" style={{ paddingLeft: `${category.level * 24}px` }}>
      {category.hasChildren ? (
        <button onClick={() => toggleExpand(category._id)} 
                className="flex-shrink-0 w-4 h-4 mr-2 text-gray-500 hover:text-gray-700 focus:outline-none">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d={expandedCategories.has(category._id) ? "M19 9l-7 7-7-7" : "M9 5l7 7-7 7"} />
          </svg>
        </button>
      ) : category.level > 0 ? (
        <div className="flex-shrink-0 w-4 h-4 mr-2">
          <span className="text-gray-400">└</span>
        </div>
      ) : null}

      <div className="flex items-center min-w-0">
        <SafeImage src={category.thumbnail} alt={category.title} 
                   className="object-cover w-10 h-10 rounded-lg" />
        <div className="min-w-0 ml-3">
          <div className="flex items-center">
            <div className="text-sm font-medium text-gray-900 truncate">{category.title}</div>
            <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
              category.level === 0 ? 'bg-blue-100 text-blue-800' : 
              category.level === 1 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {category.level === 0 ? 'Gốc' : `Cấp ${category.level + 1}`}
            </span>
            {category.hasChildren && (
              <span className="px-2 py-1 ml-2 text-xs text-orange-800 bg-orange-100 rounded-full">
                {category.children.length} con
              </span>
            )}
          </div>
          {category.level > 0 && category.parent_id && (
            <div className="mt-1 text-xs text-gray-500">Thuộc: {category.parent_id}</div>
          )}
        </div>
      </div>
    </div>
  );

  const renderParentCategory = (parentId?: string) => {
    if (!parentId?.trim()) {
      return <span className="inline-flex items-center px-2 py-1 text-xs text-blue-800 bg-blue-100 rounded-full">Danh mục gốc</span>;
    }

    const parent = findCategoryByTitle(categoryTree, parentId);
    if (!parent) {
      return <span className="text-xs text-red-500">Không tìm thấy: "{parentId}"</span>;
    }

    const path = getCategoryPath(parent);
    return (
      <div className="flex items-center">
        <SafeImage src={parent.thumbnail} alt={parent.title} className="object-cover w-8 h-8 rounded-md" width={32} height={32} />
        <div className="min-w-0 ml-2">
          <div className="text-sm font-medium text-gray-900 truncate">{parent.title}</div>
          {path.length > 1 && <div className="text-xs text-gray-500 truncate">{path.slice(0, -1).join(' → ')}</div>}
        </div>
      </div>
    );
  };

  const renderStatus = (status: string, categoryId: string) => {
    const isActive = ['active', 'hoạt động'].includes(status?.toLowerCase().trim());
    return (
      <button onClick={() => handleStatusChange(categoryId, status)}
              className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full transition-colors cursor-pointer hover:shadow-md ${
                isActive ? 'bg-green-100 text-green-800 hover:bg-green-200 border border-green-300' 
                         : 'bg-red-100 text-red-800 hover:bg-red-200 border border-red-300'
              }`}
              title={`Click để ${isActive ? 'vô hiệu hóa' : 'kích hoạt'} danh mục`}>
        <span className={`w-2 h-2 mr-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
        {isActive ? 'Hoạt động' : 'Không hoạt động'}
      </button>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 bg-gray-50">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Đang tải...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Danh sách danh mục</h1>
          <p className="mt-1 text-gray-600">
            Quản lý danh mục của cửa hàng theo cấu trúc phân cấp
            <span className="ml-4 text-sm text-gray-500">
              ({displayCategories.length} danh mục hiển thị / {categorys?.length || 0} tổng cộng)
            </span>
          </p>
        </div>

        {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

        <div className="flex gap-2 mb-4">
          <button onClick={() => setExpandedCategories(new Set(categoryTree.filter(c => c.hasChildren).map(c => c._id)))}
                  className="px-3 py-2 text-sm text-blue-700 transition-colors bg-blue-100 rounded-md hover:bg-blue-200">
            Mở rộng tất cả
          </button>
          <button onClick={() => setExpandedCategories(new Set())}
                  className="px-3 py-2 text-sm text-gray-700 transition-colors bg-gray-100 rounded-md hover:bg-gray-200">
            Thu gọn tất cả
          </button>
        </div>

        <div className="mb-6 bg-white border border-gray-200 rounded-lg">
          <CategoryFilters keyword={keyword} setKeyword={setKeyword} filterStatus={filterStatus} 
                          setFilterStatus={setFilterStatus} sortBy={sortBy} setSortBy={setSortBy} 
                          sortOrder={sortOrder} setSortOrder={setSortOrder} />
          <CategoryActions selectedCategorysCount={selectedCategorys.length} 
                          onCreateClick={() => {}} onBulkDelete={() => handleBulkDelete(selectedCategorys)}
                          startIndex={displayCategories.length > 0 ? 1 : 0} endIndex={displayCategories.length} 
                          totalItems={displayCategories.length} />
        </div>

        <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['', 'Danh mục', 'Danh mục cha', 'Mô tả', 'Trạng thái', 'Người tạo', 'Ngày tạo', 'Thao tác'].map((header, i) => (
                    <th key={i} className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      {i === 0 ? (
                        <input type="checkbox" checked={selectAll} onChange={handleSelectAll}
                               className="text-blue-600 border-gray-300 rounded shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200" />
                      ) : header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayCategories.length > 0 ? displayCategories.map((category) => (
                  <tr key={category._id} className={`hover:bg-gray-50 transition-colors ${
                    category.level > 0 ? 'bg-gray-25' : ''
                  } border-l-4 ${
                    category.level === 0 ? 'border-l-blue-500' : 
                    category.level === 1 ? 'border-l-green-400' : 'border-l-gray-300'
                  }`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input type="checkbox" checked={selectedCategorys.includes(category._id)}
                             onChange={() => handleSelectCategory(category._id)}
                             className="text-blue-600 border-gray-300 rounded shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200" />
                    </td>
                    <td className="px-6 py-4">{renderCategoryName(category)}</td>
                    <td className="px-6 py-4">{renderParentCategory(category.parent_id)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs">
                        <div className="truncate" title={category.description}>
                          {category.description || 'Không có mô tả'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{renderStatus(category.status, category._id)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{category.createdBy?.name || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                      {category.createdAt ? new Date(category.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <button onClick={() => window.location.href = `/admin/categorys/edit/${category._id}`}
                                className="text-blue-600 transition-colors hover:text-blue-900">Sửa</button>
                        <button onClick={() => handleDelete(category._id)}
                                className="text-red-600 transition-colors hover:text-red-900">Xóa</button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        {keyword || filterStatus !== 'all' ? 'Không tìm thấy danh mục nào phù hợp với bộ lọc' : 'Không tìm thấy danh mục nào'}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {displayCategories.length > 0 && (
          <div className="flex items-center justify-center mt-6 text-sm text-gray-600">
            Hiển thị {displayCategories.length} danh mục
            {(keyword || filterStatus !== 'all') && ` (đã lọc từ ${categorys?.length || 0} danh mục)`}
          </div>
        )}
      </div>
    </div>
  );
}

export default Category;