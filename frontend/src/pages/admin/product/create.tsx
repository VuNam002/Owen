import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Editor } from "@tinymce/tinymce-react";

interface Category {
  _id: number;
  title: string;
}

interface Product {
  title: string;
  description: string;
  price: string;
  discountPercentage: string;
  brand: string;
  stock: string;
  status: string;
  size: string; // Now will store JSON string of array
  color: string; // Now will store JSON string of array
  featured: string;
  position: string;
  product_category_id: string;
  thumbnail: string;
  image: string;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: string;
}

interface CloudinaryResult {
  event: string;
  info: { secure_url: string };
}

interface UploadResult {
  url?: string;
  path?: string;
  secure_url?: string;
}

// Constants
const API_BASE = "http://localhost:3000/api/v1";
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

const CLOUDINARY_CONFIG = {
  cloudName: 'duzubskpy',
  uploadPreset: 'duzubskpy',
  multiple: false,
  maxFileSize: MAX_FILE_SIZE,
  resourceType: 'image',
  clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  theme: 'purple',
};

const TINYMCE_CONFIG = {
  height: 500,
  menubar: false,
  plugins: ["advlist", "autolink", "lists", "link", "image", "charmap", "print", "preview", "anchor", "searchreplace", "visualblocks", "code", "fullscreen", "insertdatetime", "media", "table", "paste", "help", "wordcount"],
  toolbar: "undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help",
  content_style: "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
};

const INITIAL_PRODUCT_STATE: Product = {
  title: "", description: "", price: "", discountPercentage: "", brand: "", stock: "", status: "", featured: "0", position: "", product_category_id: "", thumbnail: "", image: "", size: "[]", color: "[]"
};

// Predefined options
const COLOR_OPTIONS = [
  { value: "red", label: "Đỏ", hex: "#FF0000" },
  { value: "blue", label: "Xanh dương", hex: "#0000FF" },
  { value: "green", label: "Xanh lá", hex: "#008000" },
  { value: "yellow", label: "Vàng", hex: "#FFFF00" },
  { value: "purple", label: "Tím", hex: "#800080" },


];

const SIZE_OPTIONS = [
  { value: "XS", label: "XS (Extra Small)" },
  { value: "S", label: "S (Small)" },
  { value: "M", label: "M (Medium)" },
  { value: "L", label: "L (Large)" },
  { value: "XL", label: "XL (Extra Large)" },
  { value: "XXL", label: "XXL (Double XL)" },
];

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  options?: { value: string; label: string }[] | null;
  product: Product;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  [key: string]: any;
}

// FormField component
const FormField: React.FC<FormFieldProps> = ({
  label, name, type = "text", required = false, options = null, product, onChange, ...props
}) => (
  <div>
    <label className="block mb-2 text-sm font-medium text-gray-700">
      {label} {required && "*"}
    </label>
    {options ? (
      <select 
        name={name} 
        value={product[name as keyof Product] || ""} 
        onChange={onChange} 
        required={required} 
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
        {...props}
      >
        <option value="">Chọn {label.toLowerCase()}</option>
        {options.map((opt: any) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    ) : (
      <input 
        type={type} 
        name={name} 
        value={product[name as keyof Product] || ""} 
        onChange={onChange} 
        required={required} 
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
        {...props} 
      />
    )}
  </div>
);

// Enhanced Multi-Color Picker Component
const MultiColorPicker: React.FC<{
  value: string;
  onChange: (colors: string) => void;
  allowCustom?: boolean;
}> = ({ value, onChange, allowCustom = true }) => {
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [customColor, setCustomColor] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Parse initial value
  useEffect(() => {
    try {
      const parsed = value ? JSON.parse(value) : [];
      setSelectedColors(Array.isArray(parsed) ? parsed : []);
    } catch {
      setSelectedColors([]);
    }
  }, [value]);

  const handleColorToggle = (colorValue: string) => {
    const newColors = selectedColors.includes(colorValue)
      ? selectedColors.filter(c => c !== colorValue)
      : [...selectedColors, colorValue];
    
    setSelectedColors(newColors);
    onChange(JSON.stringify(newColors));
  };

  const handleCustomColorAdd = () => {
    if (customColor.trim() && !selectedColors.includes(customColor.trim())) {
      const newColors = [...selectedColors, customColor.trim()];
      setSelectedColors(newColors);
      onChange(JSON.stringify(newColors));
      setCustomColor("");
      setShowCustomInput(false);
    }
  };

  const handleRemoveColor = (colorToRemove: string) => {
    const newColors = selectedColors.filter(c => c !== colorToRemove);
    setSelectedColors(newColors);
    onChange(JSON.stringify(newColors));
  };

  const clearAllColors = () => {
    setSelectedColors([]);
    onChange(JSON.stringify([]));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-700">
          Màu sắc ({selectedColors.length} đã chọn)
        </label>
        {selectedColors.length > 0 && (
          <button
            type="button"
            onClick={clearAllColors}
            className="text-xs text-red-600 hover:text-red-800"
          >
            Xóa tất cả
          </button>
        )}
      </div>
      
      {/* Predefined Colors */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        {COLOR_OPTIONS.map((color) => {
          const isSelected = selectedColors.includes(color.value);
          return (
            <button
              key={color.value}
              type="button"
              onClick={() => handleColorToggle(color.value)}
              className={`relative w-12 h-12 rounded-lg border-2 transition-all ${
                isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300 hover:border-gray-400'
              }`}
              style={{ backgroundColor: color.hex }}
              title={color.label}
            >
              {isSelected && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white drop-shadow" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Custom Color Input */}
      {allowCustom && (
        <div className="mb-4">
          <button
            type="button"
            onClick={() => setShowCustomInput(!showCustomInput)}
            className="mb-2 text-sm text-blue-600 hover:text-blue-800"
          >
            {showCustomInput ? 'Ẩn màu tùy chỉnh' : '+ Thêm màu tùy chỉnh'}
          </button>
          
          {showCustomInput && (
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Nhập tên màu (VD: coral, #FF6B6B)"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCustomColorAdd()}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleCustomColorAdd}
                className="px-3 py-2 text-sm text-white bg-blue-500 rounded-md hover:bg-blue-600"
              >
                Thêm
              </button>
              {customColor && (
                <div 
                  className="w-8 h-8 border border-gray-300 rounded"
                  style={{ backgroundColor: customColor }}
                ></div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Selected Colors Display */}
      {selectedColors.length > 0 && (
        <div>
          <p className="mb-2 text-sm text-gray-600">Màu đã chọn:</p>
          <div className="flex flex-wrap gap-2">
            {selectedColors.map((color, index) => {
              const predefinedColor = COLOR_OPTIONS.find(c => c.value === color);
              return (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 text-sm bg-gray-100 rounded-full"
                >
                  <div
                    className="w-4 h-4 mr-2 border border-gray-300 rounded-full"
                    style={{ backgroundColor: predefinedColor?.hex || color }}
                  ></div>
                  {predefinedColor?.label || color}
                  <button
                    type="button"
                    onClick={() => handleRemoveColor(color)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Multi-Size Selector Component
const MultiSizeSelector: React.FC<{
  value: string;
  onChange: (sizes: string) => void;
  allowCustom?: boolean;
}> = ({ value, onChange, allowCustom = true }) => {
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [customSize, setCustomSize] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Parse initial value
  useEffect(() => {
    try {
      const parsed = value ? JSON.parse(value) : [];
      setSelectedSizes(Array.isArray(parsed) ? parsed : []);
    } catch {
      setSelectedSizes([]);
    }
  }, [value]);

  const handleSizeToggle = (sizeValue: string) => {
    const newSizes = selectedSizes.includes(sizeValue)
      ? selectedSizes.filter(s => s !== sizeValue)
      : [...selectedSizes, sizeValue];
    
    setSelectedSizes(newSizes);
    onChange(JSON.stringify(newSizes));
  };

  const handleCustomSizeAdd = () => {
    if (customSize.trim() && !selectedSizes.includes(customSize.trim())) {
      const newSizes = [...selectedSizes, customSize.trim()];
      setSelectedSizes(newSizes);
      onChange(JSON.stringify(newSizes));
      setCustomSize("");
      setShowCustomInput(false);
    }
  };

  const handleRemoveSize = (sizeToRemove: string) => {
    const newSizes = selectedSizes.filter(s => s !== sizeToRemove);
    setSelectedSizes(newSizes);
    onChange(JSON.stringify(newSizes));
  };

  const clearAllSizes = () => {
    setSelectedSizes([]);
    onChange(JSON.stringify([]));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-700">
          Kích thước ({selectedSizes.length} đã chọn)
        </label>
        {selectedSizes.length > 0 && (
          <button
            type="button"
            onClick={clearAllSizes}
            className="text-xs text-red-600 hover:text-red-800"
          >
            Xóa tất cả
          </button>
        )}
      </div>
      
      {/* Predefined Sizes */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {SIZE_OPTIONS.map((size) => {
          const isSelected = selectedSizes.includes(size.value);
          return (
            <button
              key={size.value}
              type="button"
              onClick={() => handleSizeToggle(size.value)}
              className={`px-3 py-2 text-sm font-medium rounded-md border transition-all ${
                isSelected
                  ? 'bg-blue-500 text-white border-blue-500' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
              title={size.label}
            >
              {size.value}
            </button>
          );
        })}
      </div>

      {/* Custom Size Input */}
      {allowCustom && (
        <div className="mb-4">
          <button
            type="button"
            onClick={() => setShowCustomInput(!showCustomInput)}
            className="mb-2 text-sm text-blue-600 hover:text-blue-800"
          >
            {showCustomInput ? 'Ẩn kích thước tùy chỉnh' : '+ Thêm kích thước tùy chỉnh'}
          </button>
          
          {showCustomInput && (
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Nhập kích thước (VD: 38, 42, One Size)"
                value={customSize}
                onChange={(e) => setCustomSize(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCustomSizeAdd()}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleCustomSizeAdd}
                className="px-3 py-2 text-sm text-white bg-blue-500 rounded-md hover:bg-blue-600"
              >
                Thêm
              </button>
            </div>
          )}
        </div>
      )}

      {/* Selected Sizes Display */}
      {selectedSizes.length > 0 && (
        <div>
          <p className="mb-2 text-sm text-gray-600">Kích thước đã chọn:</p>
          <div className="flex flex-wrap gap-2">
            {selectedSizes.map((size, index) => {
              const predefinedSize = SIZE_OPTIONS.find(s => s.value === size);
              return (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 text-sm bg-gray-100 rounded-full"
                >
                  {predefinedSize?.label || size}
                  <button
                    type="button"
                    onClick={() => handleRemoveSize(size)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

function CreateProductPage(): JSX.Element {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [categories, setCategories] = useState<Category[]>([]);
  const [product, setProduct] = useState<Product>(INITIAL_PRODUCT_STATE);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadMethod, setUploadMethod] = useState<"url" | "cloudinary">("cloudinary");
  const [uploading, setUploading] = useState<boolean>(false);

  const isEditMode = useMemo(() => Boolean(id), [id]);
  const submitButtonText = useMemo(() => loading ? "Đang xử lý..." : (isEditMode ? "Cập nhật" : "Tạo sản phẩm"), [loading, isEditMode]);

  const apiCall = useCallback(async <T,>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> => {
    const response = await fetch(`${API_BASE}/${endpoint}`, { headers: { "Content-Type": "application/json" }, ...options });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
    }
    return response.json();
  }, []);

  const loadData = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const [categoriesResponse, productResponse] = await Promise.all([
        apiCall<Category[]>("categorys"),
        id ? apiCall<Product>(`products/detail/${id}`) : Promise.resolve(null),
      ]);

      setCategories(Array.isArray(categoriesResponse) ? categoriesResponse : categoriesResponse.data || []);

      if (productResponse?.data) {
        const data = productResponse.data;
        setProduct(prev => ({
          ...prev,
          ...Object.fromEntries(Object.entries(data).map(([key, value]) => [key, value || ""])),
          featured: data.featured || "0",
          // Ensure color and size are JSON strings
          color: typeof data.color === 'string' && data.color ? data.color : "[]",
          size: typeof data.size === 'string' && data.size ? data.size : "[]",
        }));
      }
    } catch (error) {
      console.error("Error loading data:", error);
      setError("Không thể tải dữ liệu sản phẩm. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [id, apiCall]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setProduct(prev => ({ ...prev, [name]: type === "checkbox" ? (checked ? "1" : "0") : value }));
  }, []);

  const handleColorChange = useCallback((colors: string): void => {
    setProduct(prev => ({ ...prev, color: colors }));
  }, []);

  const handleSizeChange = useCallback((sizes: string): void => {
    setProduct(prev => ({ ...prev, size: sizes }));
  }, []);

  const handleEditorChange = useCallback((content: string): void => {
    setProduct(prev => ({ ...prev, description: content }));
  }, []);

  const validateFile = useCallback((file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) return "File quá lớn. Vui lòng chọn file nhỏ hơn 10MB";
    if (!ALLOWED_FILE_TYPES.includes(file.type)) return "Định dạng file không hỗ trợ. Chỉ chấp nhận: JPG, PNG, GIF, WebP";
    return null;
  }, []);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(`${API_BASE}/upload`, { method: "POST", body: formData });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }

      const result: UploadResult = await response.json();
      const imageUrl = result.secure_url || result.url || result.path;
      
      if (!imageUrl) throw new Error("Không nhận được URL hình ảnh từ server");

      setProduct(prev => ({ ...prev, thumbnail: imageUrl, image: imageUrl }));
    } catch (error) {
      console.error("Upload error:", error);
      setError(`Không thể tải lên hình ảnh: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`);
    } finally {
      setUploading(false);
    }
  }, [validateFile]);

  const handleCloudinaryUpload = useCallback((): void => {
    const cloudinary = (window as any).cloudinary;
    if (!cloudinary) {
      setError('Cloudinary chưa được khởi tạo. Vui lòng reload trang và thử lại.');
      return;
    }

    const widget = cloudinary.createUploadWidget(CLOUDINARY_CONFIG, (error: any, result: CloudinaryResult) => {
      if (error) {
        console.error('Cloudinary upload error:', error);
        setError(`Lỗi upload Cloudinary: ${error.message}`);
        return;
      }
      if (result?.event === "success") {
        setProduct(prev => ({ ...prev, thumbnail: result.info.secure_url, image: result.info.secure_url }));
      }
    });
    widget.open();
  }, []);

  const handleUrlUpload = useCallback((): void => {
    const url = prompt("Nhập URL hình ảnh:");
    if (url?.trim()) {
      setProduct(prev => ({ ...prev, thumbnail: url.trim(), image: url.trim() }));
    }
  }, []);

  const handleRemoveImage = useCallback((): void => { 
      setProduct(prev => ({ ...prev, thumbnail: "", image: "" }));
  }, []);

  const validateForm = useCallback((): string | null => {
    if (!product.title.trim()) return "Tên sản phẩm là bắt buộc";
    if (!product.price.trim()) return "Giá sản phẩm là bắt buộc";
    if (!product.product_category_id) return "Danh mục là bắt buộc";
    if (parseFloat(product.price) <= 0) return "Giá phải lớn hơn 0";
    if (product.discountPercentage && (parseFloat(product.discountPercentage) < 0 || parseFloat(product.discountPercentage) > 100)) {
      return "Phần trăm giảm giá phải từ 0 đến 100";
    }
    return null;
  }, [product]);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const endpoint = isEditMode ? `products/edit/${id}` : "products/create";
      const method = isEditMode ? "PATCH" : "POST";

      await apiCall(endpoint, { method, body: JSON.stringify(product) });
      alert(isEditMode ? "Cập nhật sản phẩm thành công!" : "Tạo sản phẩm thành công!");
      navigate("/admin/products");
    } catch (error) {
      console.error("Submit error:", error);
      setError(isEditMode ? "Không thể cập nhật sản phẩm" : "Không thể tạo sản phẩm");
    } finally {
      setLoading(false);
    }
  }, [product, validateForm, isEditMode, id, apiCall, navigate]);

  if (loading && categories.length === 0) {
    return <div className="flex items-center justify-center h-64"><div className="text-lg">Đang tải...</div></div>;
  }

  return (
    <div className="container px-4 py-6 mx-auto">
      <div className="max-w-4xl mx-auto">
        <h1 className="mb-6 text-2xl font-bold">{isEditMode ? "Chỉnh sửa sản phẩm" : "Tạo sản phẩm mới"}</h1>

        {error && (
          <div className="px-4 py-3 mb-4 text-red-700 bg-red-100 border border-red-400 rounded">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="mb-4 text-lg font-semibold">Thông tin cơ bản</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label="Tên sản phẩm" name="title" required product={product} onChange={handleInputChange} />
              <FormField label="Thương hiệu" name="brand" product={product} onChange={handleInputChange} />
              <FormField label="Giá" name="price" type="number" required min="0" step="0.01" product={product} onChange={handleInputChange} />
              <FormField label="Phần trăm giảm giá (%)" name="discountPercentage" type="number" min="0" max="100" product={product} onChange={handleInputChange} />
              <FormField label="Tồn kho" name="stock" type="number" min="0" product={product} onChange={handleInputChange} />
              <FormField label="Danh mục" name="product_category_id" required options={categories.map(cat => ({ value: cat._id.toString(), label: cat.title }))} product={product} onChange={handleInputChange} />
              <FormField label="Trạng thái" name="status" options={[{ value: "active", label: "Hoạt động" }, { value: "inactive", label: "Không hoạt động" }]} product={product} onChange={handleInputChange} />
              <FormField label="Vị trí" name="position" type="number" min="0" product={product} onChange={handleInputChange} />
            </div>
            <div className="mt-4">
              <label className="flex items-center">
                <input type="checkbox" name="featured" checked={product.featured === "1"} onChange={handleInputChange} className="mr-2" />
                <span className="text-sm font-medium text-gray-700">Sản phẩm nổi bật</span>
              </label>
            </div>
          </div>

          {/* Color and Size */}
          <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="mb-4 text-lg font-semibold">Màu sắc & Kích thước</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <MultiColorPicker 
                value={product.color} 
                onChange={handleColorChange}
                allowCustom={true}
              />
              <MultiSizeSelector 
                value={product.size} 
                onChange={handleSizeChange}
                allowCustom={true}
              />
            </div>
          </div>

          {/* Description */}
          <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="mb-4 text-lg font-semibold">Mô tả sản phẩm</h2>
            <Editor apiKey="5x59np548dl6lfsiqgmfqhehabwaww4dq7adnud6xqioim5k" value={product.description} onEditorChange={handleEditorChange} init={TINYMCE_CONFIG} />
          </div>

          {/* Image Upload */}
          <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="mb-4 text-lg font-semibold">Hình ảnh sản phẩm</h2>
            <div className="mb-4">
              <div className="flex flex-wrap gap-4">
                {[
                  { value: "cloudinary", label: "Upload Cloudinary" },
                  { value: "url", label: "Sử dụng URL" }
                ].map(method => (
                  <label key={method.value} className="flex items-center">
                    <input type="radio" name="uploadMethod" value={method.value} checked={uploadMethod === method.value} onChange={(e) => setUploadMethod(e.target.value as "url" | "cloudinary")} className="mr-2" />
                    {method.label}
                  </label>
                ))}
              </div>
            </div>

            {uploadMethod === "cloudinary" ? (
              <div>
                <button type="button" onClick={handleCloudinaryUpload} disabled={uploading} className="px-4 py-2 text-white bg-purple-500 rounded-md hover:bg-purple-600 disabled:bg-gray-400">
                  {uploading ? "Đang upload..." : "Upload với Cloudinary"}
                </button>
                <p className="mt-2 text-xs text-gray-500">Upload trực tiếp lên Cloudinary với widget (Khuyến nghị)</p>
              </div>
            ) : (
              <div>
                <button type="button" onClick={handleUrlUpload} className="px-4 py-2 text-white bg-green-500 rounded-md hover:bg-green-600">Nhập URL hình ảnh</button>
                <p className="mt-2 text-xs text-gray-500">Nhập đường link hình ảnh từ internet</p>
              </div>
            )}

            {(product.thumbnail || product.image) && (
              <div className="mt-4">
                <p className="mb-2 text-sm text-gray-600">Hình ảnh hiện tại:</p>
                <div className="relative inline-block">
                  <img src={product.thumbnail || product.image} alt="Product thumbnail" className="object-cover w-32 h-32 border border-gray-300 rounded" />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute flex items-center justify-center w-6 h-6 text-xs text-white bg-red-500 rounded-full top-1 right-1 hover:bg-red-600"
                    title="Xóa ảnh"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={() => navigate("/admin/products")} className="px-6 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50">Hủy</button>
            <button type="submit" disabled={loading || uploading} className="px-6 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:bg-gray-400">{submitButtonText}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateProductPage;