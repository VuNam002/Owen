// components/ProductActions.tsx
import type { FC } from 'react';

interface ProductActionsProps {
  selectedProductsCount: number;
  onCreateClick: () => void;
  onBulkDelete: () => void;
  onSavePosition: () => void;
  startIndex: number;
  endIndex: number;
  totalItems: number;
}

export const ProductActions: FC<ProductActionsProps> = ({
  selectedProductsCount,
  onCreateClick,
  onBulkDelete,
  onSavePosition,
  startIndex,
  endIndex,
  totalItems
}) => {
  return (
    <div className="flex items-center gap-3 px-6 py-4">
      <button
        onClick={onCreateClick}
        className="px-4 py-2 text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700"
      >
        Thêm sản phẩm
      </button>

      {selectedProductsCount > 0 && (
        <>
          <button
            onClick={onBulkDelete}
            className="px-4 py-2 text-white transition-colors bg-red-600 rounded-md hover:bg-red-700"
          >
            Xóa đã chọn ({selectedProductsCount})
          </button>
          <button
            onClick={onSavePosition}
            className="px-4 py-2 text-white transition-colors bg-green-600 rounded-md hover:bg-green-700"
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