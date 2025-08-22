import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { JSX } from "react/jsx-runtime";
function EditCategoryPage() {
    interface Category {
        title: string;
        description: string;
        parent_id: string;
        status: string;
        position: number;
        thumbnail: string;
    }
    const API_BASE = "http://localhost:3000/api/v1";
    function EditCategory(): JSX.Element {
        const navigate = useNavigate();
        const { id } = useParams<{ id: string }>();
        const [category, setCategory] = useState<Category>({
            title: "", description: "", parent_id: "", status: "", position: 0, thumbnail: ""
        });
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState("");
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
                setError("");
                try {
                    console.log("Loading category with ID:", id); // Debug log
                    const categoryResponse = await apiCall(`categorys/detail/${id}`);
                    console.log("Full API response:", categoryResponse); // Debug log
                    
                    // Kiểm tra các cấu trúc response khác nhau
                    let categoryData = null;
                    
                    if (categoryResponse?.data) {
                        categoryData = categoryResponse.data;
                    } else if (categoryResponse && typeof categoryResponse === 'object') {
                        // Trường hợp API trả về trực tiếp object
                        categoryData = categoryResponse;
                    }
                    if (categoryData) {
                        setCategory({
                            title: categoryData.title || "",
                            description: categoryData.description || "",
                            parent_id: categoryData.parent_id || "",
                            status: categoryData.status || "",
                            position: Number(categoryData.position) || 0,
                            thumbnail: categoryData.thumbnail || ""
                        });
                    } else {
                        console.log("No category data found in response");
                        setError("Không tìm thấy dữ liệu danh mục với ID: " + id);
                    }
                } catch (error) {
                    console.error("Error loading data:", error);
                    setError(`Lỗi tải dữ liệu: ${error instanceof Error ? error.message : 'Unknown error'}`);
                } finally {
                    setLoading(false);
                }
            }
            if (id) {
                loadData();
            } else {
                setError("Không có ID danh mục");
                setLoading(false);
            }
        }, [id]);
        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
            const { name, value, type } = e.target;
            const checked = (e.target as HTMLInputElement).checked;
            setCategory(prev => ({ ...prev, [name]: type === "checkbox" ? (checked ? "1" : "0") : value }));
        };
        const handleCloudinaryUpload = () => {
            const widget = (window as any).cloudinary.createUploadWidget({
                cloudName: "duzubskpy", uploadPreset: "duzubskpy", multiple: false,
                maxFileSize: 10000000, resourceType: "image", theme: "purple",
                clientAllowedFormats: ["jpg", "jpeg", "png", "gif", "webp"]
            }, (error: any, result: any) => {
                if (error) return console.error("Cloudinary upload error:", error);
                if (result?.event === "success") {
                    setCategory(prev => ({ ...prev, thumbnail: result.info.secure_url }));
                }
            });
            widget.open();
        }
        const handleUrlUpload = () => {
            const url = prompt("Nhập URL hình ảnh:");
            if (url?.trim()) setCategory(prev => ({ ...prev, thumbnail: url.trim() }));
        }
        const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            setLoading(true);
            setError("");
            try {
                const response = await apiCall(id ? `categorys/edit/${id}` : "categorys/create", { method: "PATCH", body: JSON.stringify({ ...category, id }) });
                alert("Cập nhật thành công!");
                navigate("/admin/category");
            } catch (error) {
                console.error("Submit error:", error);
                setError("Không thể cập nhật danh mục");
            } finally {
                setLoading(false);
            }
        }
        if (loading && !category.title) {
            return <div className="flex items-center justify-center h-64"><div className="text-lg">Đang tải...</div></div>;
        }
        return (
            <div className="container max-w-4xl p-6 mx-auto">
                <div className="p-6 bg-white rounded-lg shadow-md">
                    <h1 className="mb-6 text-2xl font-bold text-gray-800">Chỉnh sửa danh mục</h1>
                    
                    {error && (
                        <div className="px-4 py-3 mb-4 text-red-700 bg-red-100 border border-red-400 rounded">
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Tiêu đề */}
                        <div>
                            <label htmlFor="title" className="block mb-2 text-sm font-medium text-gray-700">
                                Tiêu đề danh mục *
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={category.title}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Nhập tiêu đề danh mục"
                            />
                        </div>
                        {/* Mô tả */}
                        <div>
                            <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-700">
                                Mô tả
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={category.description}
                                onChange={handleInputChange}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Nhập mô tả danh mục"
                            />
                        </div>
                        {/* Danh mục cha */}
                        <div>
                            <label htmlFor="parent_id" className="block mb-2 text-sm font-medium text-gray-700">
                                Danh mục cha
                            </label>
                            <select
                                id="parent_id"
                                name="parent_id"
                                value={category.parent_id}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">-- Chọn danh mục cha --</option>
                                {/* Add options dynamically if you have parent categories */}
                            </select>
                        </div>
                        {/* Trạng thái */}
                        <div>
                            <label htmlFor="status" className="block mb-2 text-sm font-medium text-gray-700">
                                Trạng thái
                            </label>
                            <select
                                id="status"
                                name="status"
                                value={category.status}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">-- Chọn trạng thái --</option>
                                <option value="active">Hoạt động</option>
                                <option value="inactive">Không hoạt động</option>
                            </select>
                        </div>
                        {/* Vị trí */}
                        <div>
                            <label htmlFor="position" className="block mb-2 text-sm font-medium text-gray-700">
                                Vị trí sắp xếp
                            </label>
                            <input
                                type="number"
                                id="position"
                                name="position"
                                value={category.position || 0}
                                onChange={handleInputChange}
                                min="0"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Nhập vị trí sắp xếp"
                            />
                        </div>
                        {/* Hình ảnh thumbnail */}
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700">
                                Hình ảnh thumbnail
                            </label>
                            {/* Upload method selection */}
                            <div className="mb-4">
                                <div className="flex gap-4">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            value="cloudinary"
                                            checked={uploadMethod === "cloudinary"}
                                            onChange={(e) => setUploadMethod(e.target.value as "url" | "cloudinary")}
                                            className="mr-2"
                                        />
                                        Upload từ máy tính
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            value="url"
                                            checked={uploadMethod === "url"}
                                            onChange={(e) => setUploadMethod(e.target.value as "url" | "cloudinary")}
                                            className="mr-2"
                                        />
                                        Sử dụng URL
                                    </label>
                                </div>
                            </div>
                            {/* Upload buttons */}
                            <div className="flex gap-2 mb-4">
                                {uploadMethod === "cloudinary" ? (
                                    <button
                                        type="button"
                                        onClick={handleCloudinaryUpload}
                                        className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        Chọn hình ảnh
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleUrlUpload}
                                        className="px-4 py-2 text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        Nhập URL
                                    </button>
                                )}
                            </div>
                            {/* Current thumbnail display */}
                            {category.thumbnail && (
                                <div className="mb-4">
                                    <p className="mb-2 text-sm text-gray-600">Hình ảnh hiện tại:</p>
                                    <img
                                        src={category.thumbnail}
                                        alt="Thumbnail"
                                        className="object-cover w-32 h-32 border border-gray-300 rounded-md"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setCategory(prev => ({ ...prev, thumbnail: "" }))}
                                        className="mt-2 text-sm text-red-500 hover:text-red-700"
                                    >
                                        Xóa hình ảnh
                                    </button>
                                </div>
                            )}
                        </div>
                        {/* Submit buttons */}
                        <div className="flex gap-4 pt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Đang cập nhật..." : "Cập nhật danh mục"}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate("/admin/categorys")}
                                className="px-6 py-2 text-white bg-gray-500 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                            >
                                Hủy
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
    return <EditCategory />;
}
export default EditCategoryPage;