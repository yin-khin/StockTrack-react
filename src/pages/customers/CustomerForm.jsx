// src/pages/customers/CustomerForm.jsx
import React, { useState, useEffect } from "react";
import { X, User } from "lucide-react";
import { createCustomer, updateCustomer, fetchCustomerById } from "../../api/customer.api";

const CustomerForm = ({ isOpen, onClose, onSuccess, customerId = null }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isEdit = customerId !== null;

  useEffect(() => {
    if (isOpen && isEdit) {
      loadCustomer();
    } else if (isOpen && !isEdit) {
      resetForm();
    }
  }, [isOpen, customerId]);

  const loadCustomer = async () => {
    try {
      setLoading(true);
      const data = await fetchCustomerById(customerId);
      setFormData({
        name: data.name || "",
        phone: data.phone || "",
        address: data.address || ""
      });
    } catch (error) {
      console.error("Error loading customer:", error);
      setError("មិនអាចទាញយកទិន្នន័យអតិថិជនបានទេ");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      address: ""
    });
    setError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError("សូមបញ្ចូលឈ្មោះអតិថិជន");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (isEdit) {
        await updateCustomer(customerId, formData);
      } else {
        await createCustomer(formData);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving customer:", error);
      setError(
        error.response?.data?.message || 
        `មិនអាច${isEdit ? "កែសម្រួល" : "បន្ថែម"}អតិថិជនបានទេ`
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
            {isEdit ? "កែសម្រួលអតិថិជន" : "បន្ថែមអតិថិជនថ្មី"}
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

          {/* Customer Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ឈ្មោះអតិថិជន *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="បញ្ចូលឈ្មោះអតិថិជន"
              required
            />
          </div>

          {/* Phone */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              លេខទូរស័ព្ទ
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="បញ្ចូលលេខទូរស័ព្ទ"
            />
          </div>

          {/* Address */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              អាសយដ្ឋាន
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="បញ្ចូលអាសយដ្ឋាន"
            />
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

export default CustomerForm;