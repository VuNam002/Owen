import { useEffect, useRef, useState, useCallback, useMemo } from "react";
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
  title: "", description: "", price: "", discountPercentage: "", brand: "", stock: "", status: "", featured: "0", position: "", product_category_id: "", thumbnail: "", image: "",
};

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  options?: { value: string; label: string }[] | null;
  product: Product;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  [key: string]: any; // Nếu cần truyền thêm props
}

// FormField component - move outside to avoid recreation on each render
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
              <FormField label="Danh mục" name="product_category_id" required options={categories.map(cat => ({ value: cat._id, label: cat.title }))} product={product} onChange={handleInputChange} />
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