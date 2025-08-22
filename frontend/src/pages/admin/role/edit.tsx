import React, { useEffect, useState } from "react";
import { useRole } from "../../../hooks/useRole";
import { useNavigate, useParams } from "react-router-dom";
import { Editor } from "@tinymce/tinymce-react";

interface Role {
  id: string;
  title: string;
  description: string;
}

interface FormData {
  title: string;
  description: string;
}

const EditRole: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updateRole, loading, error } = useRole();

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
  });

  const [formErrors, setFormErrors] = useState<Partial<FormData>>({});

  // Fetch role data when the component mounts or id changes
  useEffect(() => {
    if (id) {
      const fetchRole = async () => {
        try {
          const response = await fetch(`/api/v1/roles/detail/${id}`);
          if (!response.ok) {
            throw new Error("Không tìm thấy vai trò");
          }
          const data = await response.json();
          setFormData({
            title: data.title,
            description: data.description,
          });
        } catch (err) {
          console.error("Lỗi khi tải dữ liệu vai trò:", err);
        }
      };

      fetchRole();
    }
  }, [id]);

  const validateForm = (): boolean => {
    const errors: Partial<FormData> = {};
    if (!formData.title.trim()) errors.title = "Tiêu đề là bắt buộc";
    if (!formData.description.trim()) errors.description = "Mô tả là bắt buộc";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !id) return;

    const success = await updateRole(id, formData);
    if (success) {
      alert("Cập nhật vai trò thành công!");
      navigate("/admin/roles");
    }
  };

  const handleCancel = () => {
    navigate("/admin/roles");
  };

  return (
    <div className="max-w-full p-6 mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="mb-6 text-2xl font-bold text-gray-800">Cập nhật vai trò</h2>

      {error && (
        <div className="p-4 mb-4 border border-red-200 rounded-md bg-red-50">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Tiêu đề *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formErrors.title ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Nhập tiêu đề"
          />
          {formErrors.title && (
            <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>
          )}
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Mô tả *
          </label>
          <Editor
            apiKey="5x59np548dl6lfsiqgmfqhehabwaww4dq7adnud6xqioim5k"
            value={formData.description}
            onEditorChange={(content) =>
              setFormData((prev) => ({ ...prev, description: content }))
            }
            init={{
              height: 500,
              menubar: false,
              plugins: [
                "advlist","autolink","lists","link","image","charmap","preview","anchor","searchreplace","visualblocks","code","fullscreen","insertdatetime","media","table","paste","help","wordcount",
              ],
              toolbar:
                "undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help",
            }}
          />
          {formErrors.description && (
            <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 font-semibold text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            Cập nhật
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 font-semibold text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditRole;
