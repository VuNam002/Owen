import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Editor } from "@tinymce/tinymce-react";
import { toast } from "react-toastify";

interface Category { _id: number; title: string; }
interface Product {
  title: string; description: string; price: string; discountPercentage: string;
  brand: string; stock: string; status: string; featured: string;
  position: string; product_category_id: string; thumbnail: string; image: string;
}

const API_BASE = "http://localhost:3000/api/v1";

function EditProduct(): JSX.Element {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [product, setProduct] = useState<Product>({
    title: "", description: "", price: "", discountPercentage: "", brand: "",
    stock: "", status: "", featured: "0", position: "", product_category_id: "",
    thumbnail: "", image: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadMethod, setUploadMethod] = useState<"url" | "cloudinary">("cloudinary");
  const [imageUrl, setImageUrl] = useState("");

  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const res = await fetch(`${API_BASE}/${endpoint}`, {
      headers: { "Content-Type": "application/json" }, ...options
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [categoriesRes, productRes] = await Promise.all([
          apiCall("categorys"),
          id ? apiCall(`products/detail/${id}`) : Promise.resolve(null)
        ]);
        
        setCategories(Array.isArray(categoriesRes) ? categoriesRes : categoriesRes.data || []);
        if (productRes?.data) {
          const data = productRes.data;
          setProduct({
            title: data.title || "", description: data.description || "", price: data.price || "",
            discountPercentage: data.discountPercentage || "", brand: data.brand || "",
            stock: data.stock || "", status: data.status || "", featured: data.featured || "0",
            position: data.position || "", product_category_id: data.product_category_id || "",
            thumbnail: data.thumbnail || "", image: data.image || ""
          });
        }
      } catch (error) {
        setError("Không thể tải dữ liệu sản phẩm");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setProduct(prev => ({ ...prev, [name]: type === "checkbox" ? (checked ? "1" : "0") : value }));
  };

  const handleCloudinaryUpload = () => {
    const widget = (window as any).cloudinary?.createUploadWidget({
      cloudName: 'duzubskpy', uploadPreset: 'duzubskpy', multiple: false,
      maxFileSize: 10000000, resourceType: 'image', theme: 'purple'
    }, (error: any, result: any) => {
      if (error) return setError('Lỗi upload: ' + error.message);
      if (result?.event === "success") {
        setProduct(prev => ({ ...prev, thumbnail: result.info.secure_url, image: result.info.secure_url }));
      }
    });
    widget ? widget.open() : setError('Cloudinary chưa được khởi tạo');
  };

  const handleUrlUpload = () => {
    if (imageUrl.trim()) {
      setProduct(prev => ({ ...prev, thumbnail: imageUrl.trim(), image: imageUrl.trim() }));
      setImageUrl("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await apiCall(id ? `products/edit/${id}` : "products/create", {
        method: id ? "PATCH" : "POST",
        body: JSON.stringify(product)
      });
      toast.success(id ? "Cập nhật thành công!" : "Tạo sản phẩm thành công!");
      navigate("/admin/products");
    } catch (error) {
      setError(id ? "Không thể cập nhật sản phẩm" : "Không thể tạo sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !categories.length) {
    return <div className="flex items-center justify-center h-64"><div className="text-lg">Đang tải...</div></div>;
  }

  return (
    <div className="container px-4 py-6 mx-auto">
      <div className="max-w-4xl mx-auto">
        <h1 className="mb-6 text-2xl font-bold">{id ? "Chỉnh sửa sản phẩm" : "Tạo sản phẩm mới"}</h1>

        {error && <div className="px-4 py-3 mb-4 text-red-700 bg-red-100 border border-red-400 rounded">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="mb-4 text-lg font-semibold">Thông tin cơ bản</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {[
                { name: "title", label: "Tên sản phẩm *", type: "text", required: true },
                { name: "brand", label: "Thương hiệu", type: "text" },
                { name: "price", label: "Giá *", type: "number", required: true, min: "0", step: "0.01" },
                { name: "discountPercentage", label: "Phần trăm giảm giá (%)", type: "number", min: "0", max: "100" },
                { name: "stock", label: "Tồn kho", type: "number", min: "0" },
                { name: "position", label: "Vị trí", type: "number", min: "0" }
              ].map(field => (
                <div key={field.name}>
                  <label className="block mb-2 text-sm font-medium text-gray-700">{field.label}</label>
                  <input
                    type={field.type}
                    name={field.name}
                    value={product[field.name as keyof Product]}
                    onChange={handleInputChange}
                    required={field.required}
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Danh mục *</label>
                <select name="product_category_id" value={product.product_category_id} onChange={handleInputChange} required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Chọn danh mục</option>
                  {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.title}</option>)}
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Trạng thái</label>
                <select name="status" value={product.status} onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Chọn trạng thái</option>
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Không hoạt động</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="flex items-center">
                <input type="checkbox" name="featured" checked={product.featured === "1"} onChange={handleInputChange} className="mr-2" />
                <span className="text-sm font-medium text-gray-700">Sản phẩm nổi bật</span>
              </label>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="mb-4 text-lg font-semibold">Mô tả sản phẩm</h2>
            <Editor
              apiKey="5x59np548dl6lfsiqgmfqhehabwaww4dq7adnud6xqioim5k"
              value={product.description}
              onEditorChange={(content) => setProduct(prev => ({ ...prev, description: content }))}
              init={{
                height: 500, menubar: false,
                plugins: ["advlist", "autolink", "lists", "link", "image", "charmap", "preview", "anchor", "searchreplace", "visualblocks", "code", "fullscreen", "insertdatetime", "media", "table", "paste", "help", "wordcount"],
                toolbar: "undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help",
                content_style: "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }"
              }}
            />
          </div>

          <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="mb-4 text-lg font-semibold">Hình ảnh sản phẩm</h2>
            <div className="flex gap-4 mb-4">
              {["cloudinary", "url"].map(method => (
                <label key={method} className="flex items-center">
                  <input type="radio" name="uploadMethod" value={method} 
                    checked={uploadMethod === method} 
                    onChange={(e) => setUploadMethod(e.target.value as "url" | "cloudinary")} className="mr-2" />
                  {method === "cloudinary" ? "Upload Cloudinary" : "Sử dụng URL"}
                </label>
              ))}
            </div>

            {uploadMethod === "cloudinary" ? (
              <button type="button" onClick={handleCloudinaryUpload} 
                className="px-4 py-2 text-white bg-purple-500 rounded-md hover:bg-purple-600">
                Upload với Cloudinary
              </button>
            ) : (
              <div className="space-y-3">
                <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Nhập URL hình ảnh..." 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" />
                <button type="button" onClick={handleUrlUpload} disabled={!imageUrl.trim()}
                  className="px-4 py-2 text-white bg-green-500 rounded-md hover:bg-green-600 disabled:bg-gray-400">
                  Áp dụng URL
                </button>
              </div>
            )}

            {(product.thumbnail || product.image) && (
              <div className="mt-4">
                <p className="mb-2 text-sm text-gray-600">Hình ảnh hiện tại:</p>
                <img src={product.thumbnail || product.image} alt="Product thumbnail"
                  className="object-cover w-32 h-32 border border-gray-300 rounded" />
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <button type="button" onClick={() => navigate("/admin/products")}
              className="px-6 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50">Hủy</button>
            <button type="submit" disabled={loading}
              className="px-6 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:bg-gray-400">
              {loading ? "Đang xử lý..." : id ? "Cập nhật" : "Tạo sản phẩm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProduct;