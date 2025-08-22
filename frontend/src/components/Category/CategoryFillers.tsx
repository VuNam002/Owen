import type { FC } from "react";

interface CategoryFiltersProps {
    keyword: string;
    setKeyword: (value: string) => void;
    filterStatus: string;
    setFilterStatus: (value: string) => void;
    sortBy: string;
    setSortBy: (value: string) => void;
    sortOrder: string;
    setSortOrder: (value: string) => void;
}
export const CategoryFilters: FC<CategoryFiltersProps> = ({
    keyword,
    setKeyword,
    filterStatus,
    setFilterStatus,
    sortBy,
    setSortBy,
}) => {
    return (
        <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-64">
                    <input
                     type="text"
                     placeholder="Tìm kiếm..."
                     value={keyword}
                     onChange={(e) => setKeyword(e.target.value)}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                </div>

                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Tất cả trạng thái</option>
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Không hoạt động</option>
                </select>

                <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="position">Vị trí</option>
                    <option value="title">Tên danh mục</option>
                    <option value="createdAt">Ngày tạo</option>
                </select>
            </div>
        </div>
    )
}
