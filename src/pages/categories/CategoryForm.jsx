// // src/pages/categories/CategoryForm.jsx
// import React, { useState, useEffect } from "react";
// import { X, Upload, Tag } from "lucide-react";
// import { createCategory, updateCategory, fetchCategoryById } from "../../api/category.api";

// const CategoryForm = ({ isOpen, onClose, onSuccess, categoryId = null }) => {
//   const [formData, setFormData] = useState({
//     name: "",
//     image: "",
//     status: 1
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [imagePreview, setImagePreview] = useState(null);

//   const isEdit = categoryId !== null;

//   useEffect(() => {
//     if (isOpen && isEdit) {
//       loadCategory();
//     } else if (isOpen && !isEdit) {
//       resetForm();
//     }
//   }, [isOpen, categoryId]);

//   const loadCategory = async () => {
//     try {
//       setLoading(true);
//       const data = await fetchCategoryById(categoryId);
//       setFormData({
//         name: data.name || "",
//         image: data.image || "",
//         status: data.status || 1
//       });
//       setImagePreview(data.image || null);
//     } catch (error) {
//       console.error("Error loading category:", error);
//       setError("មិនអាចទាញយកទិន្នន័យប្រភេទបានទេ");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetForm = () => {
//     setFormData({
//       name: "",
//       image: "",
//       status: 1
//     });
//     setImagePreview(null);
//     setError(null);
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       // Create preview
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setImagePreview(reader.result);
//         setFormData(prev => ({
//           ...prev,
//           image: reader.result
//         }));
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!formData.name.trim()) {
//       setError("សូមបញ្ចូលឈ្មោះប្រភេទ");
//       return;
//     }

//     try {
//       setLoading(true);
//       setError(null);

//       if (isEdit) {
//         await updateCategory(categoryId, formData);
//       } else {
//         await createCategory(formData);
//       }

//       onSuccess();
//       onClose();
//     } catch (error) {
//       console.error("Error saving category:", error);
//       setError(
//         error.response?.data?.message || 
//         `មិនអាច${isEdit ? "កែសម្រួល" : "បន្ថែម"}ប្រភេទបានទេ`
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
//         {/* Header */}
//         <div className="flex items-center justify-between p-6 border-b">
//           <h3 className="text-lg font-semibold text-gray-900">
//             {isEdit ? "កែសម្រួលប្រភេទ" : "បន្ថែមប្រភេទថ្មី"}
//           </h3>
//           <button
//             onClick={onClose}
//             className="text-gray-400 hover:text-gray-600"
//           >
//             <X className="w-6 h-6" />
//           </button>
//         </div>

//         {/* Form */}
//         <form onSubmit={handleSubmit} className="p-6">
//           {error && (
//             <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
//               {error}
//             </div>
//           )}

//           {/* Category Name */}
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               ឈ្មោះប្រភេទ *
//             </label>
//             <input
//               type="text"
//               name="name"
//               value={formData.name}
//               onChange={handleInputChange}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               placeholder="បញ្ចូលឈ្មោះប្រភេទ"
//               required
//             />
//           </div>

//           {/* Image Upload */}
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               រូបភាព
//             </label>
//             <div className="flex items-center space-x-4">
//               <div className="flex-1">
//                 <input
//                   type="file"
//                   accept="image/*"
//                   onChange={handleImageChange}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//               {imagePreview && (
//                 <div className="w-16 h-16 border rounded-lg overflow-hidden">
//                   <img
//                     src={imagePreview}
//                     alt="Preview"
//                     className="w-full h-full object-cover"
//                   />
//                 </div>
//               )}
//               {!imagePreview && (
//                 <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
//                   <Tag className="w-6 h-6 text-gray-400" />
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Status */}
//           <div className="mb-6">
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               ស្ថានភាព
//             </label>
//             <select
//               name="status"
//               value={formData.status}
//               onChange={handleInputChange}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             >
//               <option value={1}>សកម្ម</option>
//               <option value={0}>មិនសកម្ម</option>
//             </select>
//           </div>

//           {/* Buttons */}
//           <div className="flex space-x-3">
//             <button
//               type="button"
//               onClick={onClose}
//               className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
//             >
//               បោះបង់
//             </button>
//             <button
//               type="submit"
//               disabled={loading}
//               className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
//             >
//               {loading ? "កំពុងរក្សាទុក..." : (isEdit ? "កែសម្រួល" : "បន្ថែម")}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default CategoryForm;

// src/pages/categories/CategoryForm.jsx
import React, { useState, useEffect } from "react";
import { X, Upload, Tag } from "lucide-react";
import {
  createCategory,
  updateCategory,
  fetchCategoryById,
} from "../../api/category.api";

const CategoryForm = ({ isOpen, onClose, onSuccess, categoryId = null }) => {
  const [formData, setFormData] = useState({
    name: "",
    image: "",
    status: 1,
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isEdit = !!categoryId;

  useEffect(() => {
    if (isOpen) {
      if (isEdit) {
        loadCategory();
      } else {
        resetForm();
      }
    }
  }, [isOpen, categoryId]);

  const loadCategory = async () => {
    try {
      setLoading(true);
      const data = await fetchCategoryById(categoryId);
      setFormData({
        name: data.name || "",
        image: data.image || "",
        status: data.status ?? 1,
      });
      setPreview(data.image || null);
    } catch (err) {
      console.error("Load category failed:", err);
      setError("មិនអាចទាញយកទិន្នន័យបានទេ");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", image: "", status: 1 });
    setPreview(null);
    setError(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("រូបភាពធំពេក! សូមជ្រើសរើសរូបភាពតូចជាង 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
      setFormData((prev) => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("សូមបញ្ចូលឈ្មោះប្រភេទ");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (isEdit) {
        await updateCategory(categoryId, formData);
      } else {
        await createCategory(formData);
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Save failed:", err);
      setError(
        err.response?.data?.message ||
          `មិនអាច${isEdit ? "កែប្រែ" : "បន្ថែម"}ប្រភេទបានទេ`
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b">
          <h3 className="text-xl font-semibold text-gray-800">
            {isEdit ? "កែសម្រួលប្រភេទ" : "បន្ថែមប្រភេទថ្មី"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ឈ្មោះប្រភេទ *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="ឧ. ទូរស័ព្ទ, កាសស្តាប់..."
              required
            />
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              រូបភាព
            </label>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50">
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Tag className="w-10 h-10 text-gray-400" />
                )}
              </div>

              <div className="flex-1">
                <label className="cursor-pointer block px-4 py-2.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg text-center transition-colors">
                  <Upload className="inline-block w-5 h-5 mr-2" />
                  {preview ? "ផ្លាស់ប្តូររូបភាព" : "ជ្រើសរើសរូបភាព"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImage}
                    className="hidden"
                  />
                </label>
                <p className="mt-2 text-xs text-gray-500">
                  ទំហំអតិបរមា 5MB • JPG, PNG បាន
                </p>
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ស្ថានភាព
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value={1}>សកម្ម</option>
              <option value={0}>មិនសកម្ម</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              បោះបង់
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
            >
              {loading && (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {loading ? "កំពុងរក្សា..." : isEdit ? "រក្សាទុកការផ្លាស់ប្តូរ" : "បន្ថែម"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryForm;