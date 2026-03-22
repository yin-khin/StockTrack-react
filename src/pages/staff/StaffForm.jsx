// src/pages/staff/StaffForm.jsx
import React, { useState, useEffect } from 'react';
import { X, Upload, User } from 'lucide-react';
import { createStaff, updateStaff } from '../../api/staff.api';
import { fetchRoles } from '../../api/role.api';

const StaffForm = ({ staff, onClose }) => {
  const [formData, setFormData] = useState({
    staff_id: '',
    name: '',
    dob: '',
    gender: 'Male',
    phone: '',
    role_id: '',
    photo: '',
    status: 1
  });
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    loadRoles();
    if (staff) {
      setFormData({
        staff_id: staff.staff_id || '',
        name: staff.name || '',
        dob: staff.dob ? staff.dob.split('T')[0] : '',
        gender: staff.gender || 'Male',
        phone: staff.phone || '',
        role_id: staff.role_id || '',
        photo: staff.photo || '',
        status: staff.status !== undefined ? staff.status : 1
      });
      
      // Set image preview
      if (staff.photo && staff.photo.trim() !== '') {
        if (staff.photo.startsWith('data:')) {
          setImagePreview(staff.photo);
        } else if (/^[A-Za-z0-9+/=]+$/.test(staff.photo)) {
          // If it's base64 without prefix, add it
          setImagePreview(`data:image/jpeg;base64,${staff.photo}`);
        } else {
          setImagePreview(staff.photo);
        }
      }
    }
  }, [staff]);

  const loadRoles = async () => {
    try {
      const response = await fetchRoles();
      if (response.success && response.data) {
        setRoles(response.data);
      } else if (Array.isArray(response)) {
        setRoles(response);
      } else if (response.data && Array.isArray(response.data)) {
        setRoles(response.data);
      } else {
        console.error('Unexpected roles response format:', response);
        setRoles([]);
      }
    } catch (error) {
      console.error('Error loading roles:', error);
      alert('មិនអាចផ្ទុកតួនាទីបានទេ។ សូមពិនិត្យមើលការតភ្ជាប់។');
      setRoles([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('រូបភាពធំពេក! សូមជ្រើសរើសរូបភាពតូចជាង 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          // Create canvas to resize image
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Set max dimensions
          const maxWidth = 800;
          const maxHeight = 800;
          let width = img.width;
          let height = img.height;
          
          // Calculate new dimensions
          if (width > height) {
            if (width > maxWidth) {
              height = height * (maxWidth / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = width * (maxHeight / height);
              height = maxHeight;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw resized image
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to base64 with compression
          const resizedBase64 = canvas.toDataURL('image/jpeg', 0.7); // 70% quality
          
          console.log('Image resized:', {
            original: `${img.width}x${img.height}`,
            resized: `${width}x${height}`,
            originalSize: file.size,
            base64Length: resizedBase64.length
          });
          
          setImagePreview(resizedBase64);
          setFormData(prev => ({
            ...prev,
            photo: resizedBase64
          }));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.staff_id || !formData.name || !formData.dob || !formData.phone || !formData.role_id) {
      alert('សូមបំពេញព័ត៌មានទាំងអស់');
      return;
    }

    try {
      setLoading(true);
      
      // Prepare data for submission
      const submitData = {
        ...formData,
        // Only include photo if it exists and is not empty
        photo: formData.photo && formData.photo.trim() !== '' ? formData.photo : null
      };
      
      console.log('Submitting staff data:', {
        ...submitData,
        photo: submitData.photo ? `${submitData.photo.substring(0, 50)}... (${submitData.photo.length} chars)` : 'null'
      });
      
      let response;
      
      if (staff) {
        response = await updateStaff(staff.id, submitData);
      } else {
        response = await createStaff(submitData);
      }

      if (response.success) {
        // alert(staff ? 'បុគ្គលិកត្រូវបានកែប្រែដោយជោគជ័យ' : 'បុគ្គលិកត្រូវបានបន្ថែមដោយជោគជ័យ');
        onClose();
      }
    } catch (error) {
      console.error('Error saving staff:', error);
      console.error('Error response:', error.response?.data);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'មិនអាចរក្សាទុកបុគ្គលិកបានទេ';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">
            {staff ? 'កែប្រែបុគ្គលិក' : 'បន្ថែមបុគ្គលិកថ្មី'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 md:p-6">
          {/* Photo Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              រូបភាព
            </label>
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center border-4 border-gray-200">
                    <User className="h-16 w-16 text-gray-400" />
                  </div>
                )}
              </div>
              <label className="cursor-pointer px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-2 transition-colors">
                <Upload className="h-4 w-4" />
                <span className="text-sm">ជ្រើសរើសរូបភាព</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Staff ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                លេខកូដបុគ្គលិក *
              </label>
              <input
                type="text"
                name="staff_id"
                value={formData.staff_id}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ST001"
                required
              />
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ឈ្មោះ *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ឈ្មោះបុគ្គលិក"
                required
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ថ្ងៃខែឆ្នាំកំណើត *
              </label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ភេទ *
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="Male">ប្រុស</option>
                <option value="Female">ស្រី</option>
                <option value="Other">ផ្សេងទៀត</option>
              </select>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                លេខទូរស័ព្ទ *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="012345678"
                required
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                តួនាទី *
              </label>
              <select
                name="role_id"
                value={formData.role_id}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">ជ្រើសរើសតួនាទី</option>
                {roles.length === 0 ? (
                  <option value="" disabled>កំពុងផ្ទុក...</option>
                ) : (
                  roles.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))
                )}
              </select>
              {roles.length === 0 && (
                <p className="text-xs text-red-500 mt-1">
                  មិនមានតួនាទី។ សូមបង្កើតតួនាទីមុនសិន។
                </p>
              )}
            </div>

            {/* Status */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ស្ថានភាព
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
               <option value="">ជ្រើសរើសស្ថានភាព</option>
                <option value={1}>សកម្ម</option>
                <option value={0}>អសកម្ម</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              បោះបង់
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'កំពុងរក្សាទុក...' : staff ? 'រក្សាទុក' : 'បន្ថែម'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffForm;
