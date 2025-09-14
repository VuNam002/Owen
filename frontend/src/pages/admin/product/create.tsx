import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Editor } from "@tinymce/tinymce-react";
import { toast } from 'react-toastify';

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
  size: string;
  color: string;
  featured: string;
  position: string;
  product_category_id: string;
  thumbnail: string;
  image: string;
  gallery: string;
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

interface ImageUploadState {
  preview: string;
  uploading: boolean;
  progress: number;
  error: string | null;
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
  height: 400,
  menubar: false,
  plugins: ["advlist", "autolink", "lists", "link", "image", "charmap", "preview", "anchor", "searchreplace", "visualblocks", "code", "fullscreen", "insertdatetime", "media", "table", "paste", "help", "wordcount"],
  toolbar: "undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help",
  content_style: "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
  setup: (editor: any) => {
    editor.on('init', () => {
      editor.getBody().style.fontSize = '14px';
    });
  }
};

const INITIAL_PRODUCT_STATE: Product = {
  title: "", description: "", price: "", discountPercentage: "", brand: "", stock: "", status: "", featured: "0", position: "", product_category_id: "", thumbnail: "", image: "[]", size: "[]", color: "[]", gallery: "[]"
};

const COLOR_OPTIONS = [
  { value: "red", label: "Đỏ", hex: "#FF0000" },
  { value: "blue", label: "Xanh dương", hex: "#0000FF" },
  { value: "green", label: "Xanh lá", hex: "#008000" },
];

const SIZE_OPTIONS = [
  { value: "S", label: "S (Small)" },
  { value: "M", label: "M (Medium)" },
  { value: "L", label: "L (Large)" },
];

// Utility functions
const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.8): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    img.onload = () => {
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        const compressedFile = new File([blob!], file.name, {
          type: file.type,
          lastModified: Date.now()
        });
        resolve(compressedFile);
      }, file.type, quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
};

const validateImageUrl = (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
};

// Form Field Component
const FormField: React.FC<{
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  product: Product;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  [key: string]: any;
}> = ({ label, name, type = "text", required = false, options = null, product, onChange, ...props }) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {options ? (
      <select 
        name={name} 
        value={product[name as keyof Product] || ""} 
        onChange={onChange} 
        required={required} 
        className="w-full px-3 py-2 transition-all duration-200 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
        {...props}
      >
        <option value="">Chọn {label.toLowerCase()}</option>
        {options.map((opt) => (
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
        className="w-full px-3 py-2 transition-all duration-200 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
        {...props} 
      />
    )}
  </div>
);

// Enhanced Image Upload Component
const ImageUploadComponent: React.FC<{
  value: string;
  onChange: (url: string) => void;
  onUploadStart?: () => void;
  onUploadEnd?: () => void;
}> = ({ value, onChange, onUploadStart, onUploadEnd }) => {
  const [uploadState, setUploadState] = useState<ImageUploadState>({
    preview: value,
    uploading: false,
    progress: 0,
    error: null
  });
  const [uploadMethod, setUploadMethod] = useState<"file" | "url" | "cloudinary">("file");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUploadState(prev => ({ ...prev, preview: value }));
  }, [value]);

  const validateFile = useCallback((file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) return "File quá lớn (tối đa 10MB)";
    if (!ALLOWED_FILE_TYPES.includes(file.type)) return "Chỉ hỗ trợ: JPG, PNG, GIF, WebP";
    return null;
  }, []);

  const handleFileUpload = useCallback(async (file: File): Promise<void> => {
    const validationError = validateFile(file);
    if (validationError) {
      setUploadState(prev => ({ ...prev, error: validationError }));
      return;
    }

    setUploadState(prev => ({ ...prev, uploading: true, progress: 0, error: null }));
    onUploadStart?.();

    try {
      // Compress image
      const compressedFile = await compressImage(file);
      
      // Create preview
      const previewUrl = URL.createObjectURL(compressedFile);
      setUploadState(prev => ({ ...prev, preview: previewUrl, progress: 25 }));

      // Upload to server
      const formData = new FormData();
      formData.append("image", compressedFile);

      const xhr = new XMLHttpRequest();
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 75) + 25;
          setUploadState(prev => ({ ...prev, progress }));
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const result: UploadResult = JSON.parse(xhr.responseText);
          const imageUrl = result.secure_url || result.url || result.path;
          
          if (imageUrl) {
            onChange(imageUrl);
            setUploadState(prev => ({ 
              ...prev, 
              preview: imageUrl, 
              progress: 100,
              uploading: false 
            }));
          } else {
            throw new Error("Không nhận được URL từ server");
          }
        } else {
          throw new Error(`Upload failed: ${xhr.status}`);
        }
      };

      xhr.onerror = () => {
        throw new Error("Lỗi kết nối");
      };

      xhr.open('POST', `${API_BASE}/upload`);
      xhr.send(formData);

    } catch (error) {
      console.error("Upload error:", error);
      setUploadState(prev => ({ 
        ...prev, 
        error: `Upload thất bại: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`,
        uploading: false,
        progress: 0
      }));
    } finally {
      onUploadEnd?.();
    }
  }, [validateFile, onChange, onUploadStart, onUploadEnd]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  const handleUrlUpload = useCallback(async () => {
    const url = urlInputRef.current?.value?.trim();
    if (!url) return;

    setUploadState(prev => ({ ...prev, uploading: true, error: null }));
    
    try {
      const isValid = await validateImageUrl(url);
      if (!isValid) {
        throw new Error("URL không hợp lệ hoặc không phải ảnh");
      }
      
      onChange(url);
      setUploadState(prev => ({ ...prev, preview: url, uploading: false }));
      if (urlInputRef.current) urlInputRef.current.value = "";
    } catch (error) {
      setUploadState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'URL không hợp lệ',
        uploading: false 
      }));
    }
  }, [onChange]);

  const handleCloudinaryUpload = useCallback(() => {
    const cloudinary = (window as any).cloudinary;
    if (!cloudinary) {
      setUploadState(prev => ({ ...prev, error: 'Cloudinary chưa sẵn sàng' }));
      return;
    }

    const widget = cloudinary.createUploadWidget(CLOUDINARY_CONFIG, (error: any, result: CloudinaryResult) => {
      if (error) {
        setUploadState(prev => ({ ...prev, error: `Cloudinary error: ${error.message}` }));
        return;
      }
      if (result?.event === "success") {
        onChange(result.info.secure_url);
        setUploadState(prev => ({ ...prev, preview: result.info.secure_url }));
      }
    });
    
    widget.open();
  }, [onChange]);

  const handleRemoveImage = useCallback(() => {
    onChange("");
    setUploadState({
      preview: "",
      uploading: false,
      progress: 0,
      error: null
    });
  }, [onChange]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Hình ảnh sản phẩm</h3>
        {uploadState.preview && (
          <button
            type="button"
            onClick={handleRemoveImage}
            className="px-3 py-1 text-sm text-red-600 transition-colors rounded-md hover:text-red-800 hover:bg-red-50"
          >
            Xóa ảnh
          </button>
        )}
      </div>

      {/* Upload Method Selector */}
      <div className="flex flex-wrap gap-4 p-4 rounded-lg bg-gray-50">
        {[
          { value: "file", label: "📁 Upload File", description: "Tải lên từ máy tính" },
          { value: "url", label: "🔗 URL", description: "Nhập link ảnh" },
          { value: "cloudinary", label: "☁️ Cloudinary", description: "Upload lên cloud" }
        ].map(method => (
          <label key={method.value} className="flex items-center space-x-2 cursor-pointer">
            <input 
              type="radio" 
              name="uploadMethod" 
              value={method.value} 
              checked={uploadMethod === method.value} 
              onChange={(e) => setUploadMethod(e.target.value as any)}
              className="text-blue-600"
            />
            <div>
              <div className="text-sm font-medium">{method.label}</div>
              <div className="text-xs text-gray-500">{method.description}</div>
            </div>
          </label>
        ))}
      </div>

      {/* Upload Interface */}
      <div className="space-y-4">
        {uploadMethod === "file" && (
          <div>
            <div
              className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                dragActive 
                  ? 'border-blue-400 bg-blue-50' 
                  : uploadState.uploading 
                    ? 'border-gray-300 bg-gray-50' 
                    : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={uploadState.uploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              
              {uploadState.uploading ? (
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">Đang upload... {uploadState.progress}%</div>
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-2 transition-all duration-300 bg-blue-600 rounded-full" 
                      style={{ width: `${uploadState.progress}%` }}
                    ></div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-4xl">📸</div>
                  <div className="text-sm font-medium text-gray-900">
                    Kéo thả ảnh vào đây hoặc click để chọn
                  </div>
                  <div className="text-xs text-gray-500">
                    Hỗ trợ: JPG, PNG, GIF, WebP (tối đa 10MB)
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {uploadMethod === "url" && (
          <div className="flex space-x-2">
            <input
              ref={urlInputRef}
              type="url"
              placeholder="https://example.com/image.jpg"
              disabled={uploadState.uploading}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
            <button
              type="button"
              onClick={handleUrlUpload}
              disabled={uploadState.uploading}
              className="px-4 py-2 text-white transition-colors bg-green-500 rounded-lg hover:bg-green-600 disabled:bg-gray-400"
            >
              {uploadState.uploading ? "⏳" : "Thêm"}
            </button>
          </div>
        )}

        {uploadMethod === "cloudinary" && (
          <button
            type="button"
            onClick={handleCloudinaryUpload}
            disabled={uploadState.uploading}
            className="w-full px-4 py-3 text-white transition-colors bg-purple-500 rounded-lg hover:bg-purple-600 disabled:bg-gray-400"
          >
            {uploadState.uploading ? "⏳ Đang upload..." : "☁️ Upload với Cloudinary"}
          </button>
        )}
      </div>

      {/* Error Display */}
      {uploadState.error && (
        <div className="p-3 text-sm text-red-700 border border-red-200 rounded-lg bg-red-50">
          {uploadState.error}
        </div>
      )}

      {/* Image Preview */}
      {uploadState.preview && (
        <div className="relative inline-block">
          <img 
            src={uploadState.preview} 
            alt="Preview" 
            className="object-cover w-32 h-32 border-2 border-gray-200 rounded-lg shadow-sm"
            loading="lazy"
          />
          <div className="absolute -top-2 -right-2">
            <button
              type="button"
              onClick={handleRemoveImage}
              className="flex items-center justify-center w-6 h-6 text-sm text-white transition-colors bg-red-500 rounded-full hover:bg-red-600"
              title="Xóa ảnh"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Multi-Color Picker Component (optimized)
const MultiColorPicker: React.FC<{
  value: string;
  onChange: (colors: string) => void;
}> = ({ value, onChange }) => {
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [customColor, setCustomColor] = useState("");

  useEffect(() => {
    try {
      const parsed = value ? JSON.parse(value) : [];
      setSelectedColors(Array.isArray(parsed) ? parsed : []);
    } catch {
      setSelectedColors([]);
    }
  }, [value]);

  const handleColorToggle = useCallback((colorValue: string) => {
    const newColors = selectedColors.includes(colorValue)
      ? selectedColors.filter(c => c !== colorValue)
      : [...selectedColors, colorValue];
    
    setSelectedColors(newColors);
    onChange(JSON.stringify(newColors));
  }, [selectedColors, onChange]);

  const handleCustomColorAdd = useCallback(() => {
    if (customColor.trim() && !selectedColors.includes(customColor.trim())) {
      const newColors = [...selectedColors, customColor.trim()];
      setSelectedColors(newColors);
      onChange(JSON.stringify(newColors));
      setCustomColor("");
    }
  }, [customColor, selectedColors, onChange]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          Màu sắc ({selectedColors.length})
        </label>
        {selectedColors.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setSelectedColors([]);
              onChange(JSON.stringify([]));
            }}
            className="text-xs text-red-600 hover:text-red-800"
          >
            Xóa tất cả
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-4 gap-2">
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
                  <svg className="w-5 h-5 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex space-x-2">
        <input
          type="text"
          placeholder="Tên màu tùy chỉnh"
          value={customColor}
          onChange={(e) => setCustomColor(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleCustomColorAdd()}
          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={handleCustomColorAdd}
          className="px-3 py-2 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600"
        >
          Thêm
        </button>
      </div>

      {selectedColors.length > 0 && (
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
                  onClick={() => {
                    const newColors = selectedColors.filter(c => c !== color);
                    setSelectedColors(newColors);
                    onChange(JSON.stringify(newColors));
                  }}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Multi-Size Selector Component (optimized)
const MultiSizeSelector: React.FC<{
  value: string;
  onChange: (sizes: string) => void;
}> = ({ value, onChange }) => {
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [customSize, setCustomSize] = useState("");

  useEffect(() => {
    try {
      const parsed = value ? JSON.parse(value) : [];
      setSelectedSizes(Array.isArray(parsed) ? parsed : []);
    } catch {
      setSelectedSizes([]);
    }
  }, [value]);

  const handleSizeToggle = useCallback((sizeValue: string) => {
    const newSizes = selectedSizes.includes(sizeValue)
      ? selectedSizes.filter(s => s !== sizeValue)
      : [...selectedSizes, sizeValue];
    
    setSelectedSizes(newSizes);
    onChange(JSON.stringify(newSizes));
  }, [selectedSizes, onChange]);

  const handleCustomSizeAdd = useCallback(() => {
    if (customSize.trim() && !selectedSizes.includes(customSize.trim())) {
      const newSizes = [...selectedSizes, customSize.trim()];
      setSelectedSizes(newSizes);
      onChange(JSON.stringify(newSizes));
      setCustomSize("");
    }
  }, [customSize, selectedSizes, onChange]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          Kích thước ({selectedSizes.length})
        </label>
        {selectedSizes.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setSelectedSizes([]);
              onChange(JSON.stringify([]));
            }}
            className="text-xs text-red-600 hover:text-red-800"
          >
            Xóa tất cả
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        {SIZE_OPTIONS.map((size) => {
          const isSelected = selectedSizes.includes(size.value);
          return (
            <button
              key={size.value}
              type="button"
              onClick={() => handleSizeToggle(size.value)}
              className={`px-3 py-2 text-sm font-medium rounded-lg border transition-all ${
                isSelected
                  ? 'bg-blue-500 text-white border-blue-500' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {size.value}
            </button>
          );
        })}
      </div>

      <div className="flex space-x-2">
        <input
          type="text"
          placeholder="Kích thước tùy chỉnh"
          value={customSize}
          onChange={(e) => setCustomSize(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleCustomSizeAdd()}
          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={handleCustomSizeAdd}
          className="px-3 py-2 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600"
        >
          Thêm
        </button>
      </div>

      {selectedSizes.length > 0 && (
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
                  onClick={() => {
                    const newSizes = selectedSizes.filter(s => s !== size);
                    setSelectedSizes(newSizes);
                    onChange(JSON.stringify(newSizes));
                  }}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Main Component
function CreateProductPage(): JSX.Element {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [categories, setCategories] = useState<Category[]>([]);
  const [product, setProduct] = useState<Product>(INITIAL_PRODUCT_STATE);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);

  const isEditMode = useMemo(() => Boolean(id), [id]);
  const submitButtonText = useMemo(() => 
    loading ? "Đang xử lý..." : (isEditMode ? "Cập nhật" : "Tạo sản phẩm"), 
    [loading, isEditMode]
  );

  // API call utility
  const apiCall = useCallback(async <T,>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> => {
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

  // Load initial data
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
          ...Object.fromEntries(
            Object.entries(data).map(([key, value]) => [key, value || ""])
          ),
          featured: data.featured || "0",
          color: typeof data.color === 'string' && data.color ? data.color : "[]",
          size: typeof data.size === 'string' && data.size ? data.size : "[]",
        }));
      }
    } catch (error) {
      console.error("Error loading data:", error);
      setError("Không thể tải dữ liệu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [id, apiCall]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Form handlers
  const handleInputChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setProduct(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? "1" : "0") : value
    }));
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

  const handleImageChange = useCallback((url: string): void => {
    setProduct(prev => ({ ...prev, thumbnail: url, image: url }));
  }, []);

  // Form validation
  const validateForm = useCallback((): string | null => {
    if (!product.title.trim()) return "Tên sản phẩm là bắt buộc";
    if (!product.price.trim()) return "Giá sản phẩm là bắt buộc";
    if (!product.product_category_id) return "Danh mục là bắt buộc";
    if (parseFloat(product.price) <= 0) return "Giá phải lớn hơn 0";
    if (product.discountPercentage && 
        (parseFloat(product.discountPercentage) < 0 || parseFloat(product.discountPercentage) > 100)) {
      return "Phần trăm giảm giá phải từ 0 đến 100";
    }
    return null;
  }, [product]);

  // Form submission
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

      await apiCall(endpoint, {
        method,
        body: JSON.stringify(product)
      });

      toast.success(isEditMode ? "Cập nhật sản phẩm thành công!" : "Tạo sản phẩm thành công!");
      navigate("/admin/products");
    } catch (error) {
      console.error("Submit error:", error);
      setError(isEditMode ? "Không thể cập nhật sản phẩm" : "Không thể tạo sản phẩm");
    } finally {
      setLoading(false);
    }
  }, [product, validateForm, isEditMode, id, apiCall, navigate]);

  // Upload handlers
  const handleUploadStart = useCallback(() => {
    setUploading(true);
    setError(null);
  }, []);

  const handleUploadEnd = useCallback(() => {
    setUploading(false);
  }, []);

  // Loading state
  if (loading && categories.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-b-2 border-blue-500 rounded-full animate-spin"></div>
          <div className="text-lg text-gray-600">Đang tải...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="container px-4 mx-auto">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <nav className="flex items-center mb-4 space-x-2 text-sm text-gray-500">
              <button 
                onClick={() => navigate("/admin/products")}
                className="transition-colors hover:text-blue-600"
              >
                Sản phẩm
              </button>
              <span>/</span>
              <span className="text-gray-900">
                {isEditMode ? "Chỉnh sửa" : "Tạo mới"}
              </span>
            </nav>
            
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditMode ? "Chỉnh sửa sản phẩm" : "Tạo sản phẩm mới"}
            </h1>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="px-4 py-3 mb-6 text-red-700 border-l-4 border-red-400 rounded-r-lg bg-red-50">
              <div className="flex items-center">
                <span className="mr-2 text-red-500">⚠️</span>
                {error}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-xl">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900">Thông tin cơ bản</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <FormField 
                    label="Tên sản phẩm" 
                    name="title" 
                    required 
                    product={product} 
                    onChange={handleInputChange} 
                  />
                  <FormField 
                    label="Thương hiệu" 
                    name="brand" 
                    product={product} 
                    onChange={handleInputChange} 
                  />
                  <FormField 
                    label="Giá (VNĐ)" 
                    name="price" 
                    type="number" 
                    required 
                    min="0" 
                    step="1000" 
                    product={product} 
                    onChange={handleInputChange} 
                  />
                  <FormField 
                    label="Giảm giá (%)" 
                    name="discountPercentage" 
                    type="number" 
                    min="0" 
                    max="100" 
                    product={product} 
                    onChange={handleInputChange} 
                  />
                  <FormField 
                    label="Số lượng tồn" 
                    name="stock" 
                    type="number" 
                    min="0" 
                    product={product} 
                    onChange={handleInputChange} 
                  />
                  <FormField 
                    label="Danh mục" 
                    name="product_category_id" 
                    required 
                    options={categories.map(cat => ({ 
                      value: cat._id.toString(), 
                      label: cat.title 
                    }))} 
                    product={product} 
                    onChange={handleInputChange} 
                  />
                  <FormField 
                    label="Trạng thái" 
                    name="status" 
                    options={[
                      { value: "active", label: "Hoạt động" }, 
                      { value: "inactive", label: "Không hoạt động" }
                    ]} 
                    product={product} 
                    onChange={handleInputChange} 
                  />
                  <FormField 
                    label="Vị trí hiển thị" 
                    name="position" 
                    type="number" 
                    min="0" 
                    product={product} 
                    onChange={handleInputChange} 
                  />
                </div>
                
                <div className="mt-6">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="featured" 
                      checked={product.featured === "1"} 
                      onChange={handleInputChange} 
                      className="w-4 h-4 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2" 
                    />
                    <span className="text-sm font-medium text-gray-700">
                      🌟 Sản phẩm nổi bật
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Color and Size */}
            <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-xl">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900">Thuộc tính sản phẩm</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                  <MultiColorPicker 
                    value={product.color} 
                    onChange={handleColorChange}
                  />
                  <MultiSizeSelector 
                    value={product.size} 
                    onChange={handleSizeChange}
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-xl">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900">Mô tả sản phẩm</h2>
              </div>
              <div className="p-6">
                <Editor
                  apiKey="5x59np548dl6lfsiqgmfqhehabwaww4dq7adnud6xqioim5k"
                  value={product.description}
                  onEditorChange={handleEditorChange}
                  init={TINYMCE_CONFIG}
                />
              </div>
            </div>

            {/* Image Upload */}
            <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-xl">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900">Hình ảnh</h2>
              </div>
              <div className="p-6">
                <ImageUploadComponent
                  value={product.thumbnail}
                  onChange={handleImageChange}
                  onUploadStart={handleUploadStart}
                  onUploadEnd={handleUploadEnd}
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center justify-end pt-6 space-x-4">
              <button 
                type="button" 
                onClick={() => navigate("/admin/products")} 
                className="px-6 py-3 text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy bỏ
              </button>
              <button 
                type="submit" 
                disabled={loading || uploading} 
                className="flex items-center px-8 py-3 space-x-2 text-white transition-all bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {(loading || uploading) && (
                  <div className="w-4 h-4 border-b-2 border-white rounded-full animate-spin"></div>
                )}
                <span>{submitButtonText}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateProductPage;