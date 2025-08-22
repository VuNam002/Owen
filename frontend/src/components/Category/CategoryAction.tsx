import type { FC } from "react";
import { Link } from "react-router-dom";

interface CategoryProps {
    selectdCategorysCount: number;
    onCreateClick: () => void;
    onBulkDelete: () => void;
    onSavePosition: () => void;
    startIndex: number;
    endIndex: number;
    totalItems: number;
}
export const CategoryActions: FC<CategoryProps> = ({
    selectdCategorysCount,
    onBulkDelete,
    onSavePosition,
    startIndex,
    endIndex,
    totalItems
}) => {
    return (
        <div className="flex items-center gap-3 px-6 py-4">
            <Link
                to="/admin/categorys/create"
                className="px-4 py-2 text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700"
            >
                Thêm danh mục
            </Link>
            {selectdCategorysCount > 0 && (
                <>
                <button
                    onClick={onBulkDelete}
                    className="px-4 py-2 text-white transition-colors bg-red-600" 
                >
                    Xóa đã chọn ({selectdCategorysCount})
                </button>
                <button
                    onClick={onSavePosition}
                    className="px-4 py-2 text-white transition-colors bg-green-600"
                >
                    Lưu vị trí
                </button>
                </>
            )}
            <div className="text-sm text-gray-500">
                Hiển thị {startIndex + 1}-{Math.min(endIndex, totalItems)} của {totalItems} sản phẩm
            </div>
        </div>
    );
};