// src/pages/brands/BrandForm.jsx
import React, { useState, useEffect } from "react";
import { X, Upload, Award } from "lucide-react";
import { createBrand, updateBrand, fetchBrandById } from "../../api/brand.api";

const BrandForm = ({ isOpen, onClose, onSuccess, brandId = null }) => {
  const [formData, setFormData] = useState({
    name: "",
    image: "",
    status: 1
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const isEdit = brandId !== null;

  useEffect(() => {
    if (isOpen && isEdit) {
      loadBrand();
    } else if (isOpen && !isEdit) {
      resetForm();
    }
  }, [isOpen, brandId]);

  const loadBrand = async () => {
    try {
      setLoading(true);
      const data = await fetchBrandById(brandId);
      setFormData({
        name: data.name || "",
        image: data.image || "",
        status: data.status || 1
      });
      setImagePreview(data.image || null);
    } catch (error) {
      console.error("Error loading brand:", error);
      setError("មិនអាចទាញយកទិន្នន័យម៉ាកយីហោបានទេ");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      image: "",
      status: 1
    });
    setImagePreview(null);
    setError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData(prev => ({
          ...prev,
          image: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError("សូមបញ្ចូលឈ្មោះម៉ាកយីហោ");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (isEdit) {
        await updateBrand(brandId, formData);
      } else {
        await createBrand(formData);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving brand:", error);
      setError(
        error.response?.data?.message || 
        `មិនអាច${isEdit ? "កែសម្រួល" : "បន្ថែម"}ម៉ាកយីហោបានទេ`
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            {isEdit ? "កែសម្រួលម៉ាកយីហោ" : "បន្ថែមម៉ាកយីហោថ្មី"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Brand Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ឈ្មោះម៉ាកយីហោ *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="បញ្ចូលឈ្មោះម៉ាកយីហោ"
              required
            />
          </div>

          {/* Image Upload */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              រូបភាព
            </label>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {imagePreview && (
                <div className="w-16 h-16 border rounded-lg overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              {!imagePreview && (
                <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ស្ថានភាព
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={1}>សកម្ម</option>
              <option value={0}>មិនសកម្ម</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              បោះបង់
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "កំពុងរក្សាទុក..." : (isEdit ? "កែសម្រួល" : "បន្ថែម")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BrandForm;