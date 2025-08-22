import type React from "react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

interface Category {
    title: string;
    description: string;
    parent_id: string;
    image: string;
    status: string;
    position: number;
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

const API_BASE = "http://localhost:3000/api/v1";
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const INITIAL_CATEGORY_STATE: Category = { title: "", description: "", parent_id: "", image: "", status: "", position: 0 };

const CLOUDINARY_CONFIG = {
  cloudName: 'duzubskpy', uploadPreset: 'duzubskpy', multiple: false, maxFileSize: MAX_FILE_SIZE,
  resourceType: 'image', clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'], theme: 'purple',
};

const TINYMCE_CONFIG = {
  height: 500, menubar: false,
  plugins: ["advlist", "autolink", "lists", "link", "image", "charmap", "print", "preview", "anchor", "searchreplace", "visualblocks", "code", "fullscreen", "insertdatetime", "media", "table", "paste", "help", "wordcount"],
  toolbar: "undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help",
  content_style: "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
};

interface FormFieldProps {
    label: string;
    name: string;
    type?: string;
    required?: boolean;
    options?: { value: string; label: string }[] | null;
    category: Category;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const FormField: React.FC<FormFieldProps> = ({
  label, name, type = "text", required = false, options = null, category, onChange, ...props
}) => {
    const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500";
    const value = category[name as keyof Category] || "";
    
    return (
        <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
                {label} {required && "*"}
            </label>
            {options ? (
                <select name={name} value={value} onChange={onChange} required={required} className={inputClass} {...props}>
                    {options.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
            ) : (
                <input type={type} name={name} value={value} onChange={onChange} required={required} className={inputClass} {...props} />
            )}
        </div>
    );
};

function CreateCategoryPage(): JSX.Element {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [category, setCategory] = useState<Category>(INITIAL_CATEGORY_STATE);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [uploadMethod, setUploadMethod] = useState<"url" | "cloudinary">("cloudinary");
    const [imageUrl, setImageUrl] = useState("");
    const [uploading, setUploading] = useState<boolean>(false);

    const isEditMode = useMemo(() => Boolean(id), [id]);
    const submitButtonText = useMemo(() => 
        loading ? "Đang xử lý..." : (isEditMode ? "Cập nhật" : "Tạo danh mục"), 
        [loading, isEditMode]
    );

    const apiCall = useCallback(async <T,>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> => {
        const response = await fetch(`${API_BASE}/${endpoint}`, { 
            headers: { "Content-Type": "application/json" }, 
            ...options 
        });
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
            const [categoriesResponse, categoryResponse] = await Promise.all([
                apiCall<Category[]>('categorys'),
                id ? apiCall<Category>(`categorys/detail/${id}`) : Promise.resolve(null)
            ]);
            
            if (categoriesResponse?.data) setCategories(categoriesResponse.data);
            if (categoryResponse?.data) {
                setCategory(prev => ({
                    ...prev,
                    ...Object.fromEntries(Object.entries(categoryResponse.data).map(([key, value]) => [key, value || ""]))
                }));
            }
        } catch (error) {
            console.error("Error loading data:", error);
            setError("Không thể tải dữ liệu danh mục. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    }, [id, apiCall]);

    useEffect(() => { 
        loadData(); 
    }, [loadData]);

    // Tạo options cho danh mục cha
    const parentCategoryOptions = useMemo(() => [
        { value: "", label: "Không có danh mục cha" },
        ...categories
            .filter(cat => !id || cat.title !== category.title)
            .map(cat => ({ value: cat.parent_id || cat.title, label: cat.title }))
    ], [categories, id, category.title]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setCategory(prev => ({ ...prev, [name]: type === "checkbox" ? (checked ? "1" : "0") : value }));
    }, []);

    const handleEditorChange = useCallback((content: string): void => {
        setCategory(prev => ({ ...prev, description: content }));
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
        if (validationError) { setError(validationError); return; }

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

            setCategory(prev => ({ ...prev, image: imageUrl }));
        } catch (error) {
            console.error("Upload error:", error);
            setError(`Không thể tải lên hình ảnh: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`);
        } finally {
            setUploading(false);
        }
    }, [validateFile]);

    const handleCloudinaryUpload = useCallback((): void => {
        const cloudinary = (window as any).cloudinary;
        if (!cloudinary) { setError('Cloudinary chưa được khởi tạo. Vui lòng reload trang và thử lại.'); return; }

        const widget = cloudinary.createUploadWidget(CLOUDINARY_CONFIG, (error: any, result: CloudinaryResult) => {
            if (error) { console.error('Cloudinary upload error:', error); setError(`Lỗi upload Cloudinary: ${error.message}`); return; }
            if (result?.event === "success") setCategory(prev => ({ ...prev, image: result.info.secure_url }));
        });
        widget.open();
    }, []);

    const handleUrlUpload = useCallback((): void => {
        const url = prompt("Nhập URL hình ảnh:");
        if (url?.trim()) setCategory(prev => ({ ...prev, image: url.trim() }));
    }, []);

    const handleRemoveImage = useCallback((): void => { 
        setCategory(prev => ({ ...prev, image: "" })); 
    }, []);

    const validateForm = useCallback((): string | null => {
        if (!category.title.trim()) return "Tên danh mục là bắt buộc";
        return null;
    }, [category]);

    const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        
        const validationError = validateForm();
        if (validationError) { setError(validationError); return; }

        setLoading(true);
        setError(null);

        try {
            const endpoint = isEditMode ? `categorys/edit/${id}` : "categorys/create";
            const method = isEditMode ? "PATCH" : "POST";
            await apiCall(endpoint, { method, body: JSON.stringify(category) });
            alert(isEditMode ? "Cập nhật danh mục thành công!" : "Tạo danh mục thành công!");
            navigate("/admin/category");
        } catch (error) {
            console.error("Submit error:", error);
            setError(isEditMode ? "Không thể cập nhật danh mục" : "Không thể tạo danh mục");
        } finally {
            setLoading(false);
        }
    }, [category, validateForm, isEditMode, id, apiCall, navigate]);

    // Loading state
    if (loading && (isEditMode || categories.length === 0)) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg">Đang tải...</div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl p-6 mx-auto bg-white rounded-lg shadow-md">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                    {isEditMode ? "Chỉnh sửa danh mục" : "Tạo danh mục mới"}
                </h1>
                <p className="mt-2 text-gray-600">
                    {isEditMode ? "Cập nhật thông tin danh mục" : "Điền thông tin để tạo danh mục mới"}
                </p>
            </div>

            {error && (
                <div className="p-4 mb-4 border border-red-200 rounded-md bg-red-50">
                    <div className="flex">
                        <div className="ml-3">
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                        label="Tên danh mục"
                        name="title"
                        required
                        category={category}
                        onChange={handleInputChange}
                        placeholder="Nhập tên danh mục"
                    />

                    <FormField
                        label="Danh mục cha"
                        name="parent_id"
                        options={parentCategoryOptions}
                        category={category}
                        onChange={handleInputChange}
                    />

                    <FormField
                        label="Trạng thái"
                        name="status"
                        options={[
                            { value: "", label: "Chọn trạng thái" },
                            { value: "active", label: "Kích hoạt" },
                            { value: "inactive", label: "Không kích hoạt" }
                        ]}
                        category={category}
                        onChange={handleInputChange}
                    />

                    <FormField
                        label="Vị trí"
                        name="position"
                        type="number"
                        category={category}
                        onChange={handleInputChange}
                        placeholder="Nhập vị trí sắp xếp"
                    />
                </div>

                <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                        Mô tả
                    </label>
                    <textarea
                        name="description"
                        value={category.description}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nhập mô tả cho danh mục"
                    />
                </div>

                {/* Image Upload Section */}
                <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                        Hình ảnh
                    </label>
                    
                    <div className="space-y-4">
                        {/* Upload Method Selection */}
                        <div className="flex space-x-4">
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    value="cloudinary"
                                    checked={uploadMethod === "cloudinary"}
                                    onChange={(e) => setUploadMethod(e.target.value as "url" | "cloudinary")}
                                    className="form-radio"
                                />
                                <span className="ml-2">Upload từ máy tính</span>
                            </label>
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    value="url"
                                    checked={uploadMethod === "url"}
                                    onChange={(e) => setUploadMethod(e.target.value as "url" | "cloudinary")}
                                    className="form-radio"
                                />
                                <span className="ml-2">Nhập URL</span>
                            </label>
                        </div>

                        {/* Upload Buttons */}
                        <div className="flex space-x-2">
                            {uploadMethod === "cloudinary" && (
                                <>
                                    <input
                                        type="file"
                                        accept={ALLOWED_FILE_TYPES.join(',')}
                                        onChange={handleFileUpload}
                                        className="hidden"
                                        id="file-upload"
                                        disabled={uploading}
                                    />
                                    <label
                                        htmlFor="file-upload"
                                        className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer ${
                                            uploading ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                    >
                                        {uploading ? "Đang tải lên..." : "Chọn file"}
                                    </label>
                                    <button
                                        type="button"
                                        onClick={handleCloudinaryUpload}
                                        className="px-4 py-2 text-white bg-purple-500 rounded hover:bg-purple-600"
                                    >
                                        Upload Cloudinary
                                    </button>
                                </>
                            )}
                            
                            {uploadMethod === "url" && (
                                <button
                                    type="button"
                                    onClick={handleUrlUpload}
                                    className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600"
                                >
                                    Thêm URL
                                </button>
                            )}
                        </div>

                        {/* Image Preview */}
                        {category.image && (
                            <div className="relative">
                                <img
                                    src={category.image}
                                    alt="Preview"
                                    className="object-cover w-32 h-32 border rounded"
                                />
                                <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    className="absolute top-0 right-0 flex items-center justify-center w-6 h-6 text-sm text-white bg-red-500 rounded-full hover:bg-red-600"
                                >
                                    ×
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={() => navigate("/admin/categorys")}
                        className="px-6 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                        disabled={loading}
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        disabled={loading || uploading}
                        className={`px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 ${
                            (loading || uploading) ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        {submitButtonText}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CreateCategoryPage;