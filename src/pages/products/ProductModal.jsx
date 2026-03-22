// // src/components/products/ProductModal.jsx
// import React, { useState, useEffect } from "react";
// import {
//   createProduct,
//   updateProduct,
//   fetchProductById,
// } from "../../api/product.api";
// import { fetchCategories } from "../../api/category.api";
// import { fetchBrands } from "../../api/brand.api";

// const ProductModal = ({ isOpen, onClose, productId, refreshProducts }) => {
//   const [name, setName] = useState("");
//   const [category_id, setCategoryId] = useState("");
//   const [brand_id, setBrandId] = useState("");
//   const [price, setPrice] = useState("");
//   const [sale_price, setSalePrice] = useState("");
//   const [qty, setQty] = useState("");
//   const [barcode, setBarcode] = useState("");
//   const [image, setImage] = useState("");
//   const [imageFile, setImageFile] = useState(null);
//   const [imagePreview, setImagePreview] = useState("");
//   const [status, setStatus] = useState(0);
//   const [expire_date, setExpireDate] = useState("");
//   const [error, setError] = useState(null);

//   // State for categories and brands
//   const [categories, setCategories] = useState([]);
//   const [brands, setBrands] = useState([]);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     // Fetch categories and brands
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         const [categoriesData, brandsData] = await Promise.all([
//           fetchCategories(),
//           fetchBrands(),
//         ]);
        
//         // API functions already extract the data, but ensure it's an array
//         setCategories(Array.isArray(categoriesData) ? categoriesData : []);
//         setBrands(Array.isArray(brandsData) ? brandsData : []);
//       } catch (error) {
//         console.error("Error fetching categories or brands:", error);
//         setError("មិនអាចទាញយកទិន្នន័យប្រភេទ និងម៉ាកបានទេ");
//         // Set empty arrays to prevent undefined errors
//         setCategories([]);
//         setBrands([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (isOpen) {
//       fetchData();
//     }
//   }, [isOpen]);

//   useEffect(() => {
//     if (productId && isOpen) {
//       const getProduct = async () => {
//         try {
//           setLoading(true);
//           const product = await fetchProductById(productId);
//           setName(product.name || "");
//           setCategoryId(product.category_id || "");
//           setBrandId(product.brand_id || "");
//           setPrice(product.price || "");
//           setSalePrice(product.sale_price || "");
//           setQty(product.qty || "");
//           setBarcode(product.barcode || "");
//           // Set image and preview if image exists
//           if (product.image) {
//             setImage(product.image);
//             // If it's a base64 string, also set preview
//             if (product.image.startsWith("data:image")) {
//               setImagePreview(product.image);
//             } else if (product.image.startsWith("http://") || product.image.startsWith("https://")) {
//               setImagePreview(product.image);
//             } else {
//               // If it's stored without prefix, assume it's base64 and add data URL prefix
//               setImagePreview(product.image);
//             }
//           } else {
//             setImage("");
//             setImagePreview("");
//           }
//           setStatus(product.status || 0);
//           setExpireDate(
//             product.expire_date ? product.expire_date.split("T")[0] : ""
//           );
//         } catch (error) {
//           setError("មិនអាចទាញយកព័ត៌មានផលិតផលបានទេ");
//           console.error("Error fetching product:", error);
//         } finally {
//           setLoading(false);
//         }
//       };

//       getProduct();
//     } else if (isOpen) {
//       // Reset fields for a new product
//       resetFields();
//     }
//   }, [productId, isOpen]);

//   const resetFields = () => {
//     setName("");
//     setCategoryId("");
//     setBrandId("");
//     setPrice("");
//     setSalePrice("");
//     setQty("");
//     setBarcode("");
//     setImage("");
//     setImageFile(null);
//     setImagePreview("");
//     setStatus(0);
//     setExpireDate("");
//     setError(null);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError(null);

//     // Validation
//     if (!name || !category_id || !brand_id || !price || !qty || !barcode) {
//       setError("សូមបំពេញព័ត៌មានចាំបាច់ទាំងអស់");
//       return;
//     }

//     try {
//       setLoading(true);
//       const productData = {
//         name,
//         category_id: parseInt(category_id),
//         brand_id: parseInt(brand_id),
//         price: parseFloat(price),
//         sale_price: sale_price ? parseFloat(sale_price) : null,
//         qty: parseInt(qty),
//         barcode,
//         image,
//         status: parseInt(status),
//         expire_date: expire_date || null,
//       };

//       if (productId) {
//         await updateProduct(productId, productData);
//       } else {
//         await createProduct(productData);
//       }

//       resetFields();
//       if (refreshProducts) refreshProducts();
//       onClose();
//     } catch (error) {
//       console.error("Error saving product:", error);
//       setError(
//         error.response?.data?.message || "មានបញ្ហាក្នុងការរក្សាទុកផលិតផល"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4 overflow-y-auto z-50">
//       <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-md md:max-w-2xl mx-auto my-4 md:my-8 max-h-[90vh] overflow-y-auto">
//         <div className="flex justify-between items-center mb-4 md:mb-6">
//           <h2 className="text-xl font-bold text-gray-800">
//             {productId ? "កែសម្រួលផលិតផល" : "បន្ថែមផលិតផល"}
//           </h2>
//           <button
//             onClick={onClose}
//             className="text-gray-500 hover:text-gray-700 text-2xl"
//           >
//             &times;
//           </button>
//         </div>

//         {error && (
//           <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
//             {error}
//           </div>
//         )}

//         {loading && !productId ? (
//           <div className="text-center py-8">
//             <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//             <p className="mt-2 text-gray-600">កំពុងផ្ទុក...</p>
//           </div>
//         ) : (
//           <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
//             {/* Product Name */}
//             <div className="space-y-2">
//               <label className="block text-gray-700 text-sm font-medium">
//                 ឈ្មោះផលិតផល *
//               </label>
//               <input
//                 type="text"
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//                 className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
//                 placeholder="បញ្ចូលឈ្មោះផលិតផល"
//                 disabled={loading}
//               />
//             </div>

//             {/* Category & Brand Dropdowns */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
//               {/* Category Dropdown */}
//               <div className="space-y-2">
//                 <label className="block text-gray-700 text-sm font-medium">
//                   ប្រភេទផលិតផល *
//                 </label>
//                 <div className="relative">
//                   <select
//                     value={category_id}
//                     onChange={(e) => setCategoryId(e.target.value)}
//                     className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base bg-white appearance-none"
//                     disabled={loading || !categories || categories.length === 0}
//                     required
//                   >
//                     <option value="">ជ្រើសរើសប្រភេទ</option>
//                     {categories && categories.length > 0 && categories.map((category) => (
//                       <option key={category.id} value={category.id}>
//                         {category.name}
//                       </option>
//                     ))}
//                   </select>
//                   <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
//                     <svg
//                       className="fill-current h-4 w-4"
//                       xmlns="http://www.w3.org/2000/svg"
//                       viewBox="0 0 20 20"
//                     >
//                       <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
//                     </svg>
//                   </div>
//                 </div>
//                 {(!categories || categories.length === 0) && !loading && (
//                   <p className="text-xs text-red-500">
//                     មិនមានប្រភេទផលិតផលទេ។ សូមបន្ថែមប្រភេទមុន។
//                   </p>
//                 )}
//               </div>

//               {/* Brand Dropdown */}
//               <div className="space-y-2">
//                 <label className="block text-gray-700 text-sm font-medium">
//                   ម៉ាក *
//                 </label>
//                 <div className="relative">
//                   <select
//                     value={brand_id}
//                     onChange={(e) => setBrandId(e.target.value)}
//                     className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base bg-white appearance-none"
//                     disabled={loading || !brands || brands.length === 0}
//                     required
//                   >
//                     <option value="">ជ្រើសរើសម៉ាក</option>
//                     {brands && brands.length > 0 && brands.map((brand) => (
//                       <option key={brand.id} value={brand.id}>
//                         {brand.name}
//                       </option>
//                     ))}
//                   </select>
//                   <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
//                     <svg
//                       className="fill-current h-4 w-4"
//                       xmlns="http://www.w3.org/2000/svg"
//                       viewBox="0 0 20 20"
//                     >
//                       <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
//                     </svg>
//                   </div>
//                 </div>
//                 {(!brands || brands.length === 0) && !loading && (
//                   <p className="text-xs text-red-500">
//                     មិនមានម៉ាកទេ។ សូមបន្ថែមម៉ាកមុន។
//                   </p>
//                 )}
//               </div>
//             </div>

//             {/* Price & Sale Price */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
//               <div className="space-y-2">
//                 <label className="block text-gray-700 text-sm font-medium">
//                   តម្លៃ *
//                 </label>
//                 <div className="relative">
//                   <input
//                     type="number"
//                     step="0.01"
//                     min="0"
//                     value={price}
//                     onChange={(e) => setPrice(e.target.value)}
//                     className="border border-gray-300 rounded-lg p-3 w-full pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
//                     placeholder="0.00"
//                     disabled={loading}
//                     required
//                   />
//                   <span className="absolute left-3 top-3.5 text-gray-500">
//                     $
//                   </span>
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <label className="block text-gray-700 text-sm font-medium">
//                   តម្លៃលក់
//                 </label>
//                 <div className="relative">
//                   <input
//                     type="number"
//                     step="0.01"
//                     min="0"
//                     value={sale_price}
//                     onChange={(e) => setSalePrice(e.target.value)}
//                     className="border border-gray-300 rounded-lg p-3 w-full pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
//                     placeholder="0.00"
//                     disabled={loading}
//                   />
//                   <span className="absolute left-3 top-3.5 text-gray-500">
//                     $
//                   </span>
//                 </div>
//               </div>
//             </div>

//             {/* Quantity & Barcode */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
//               <div className="space-y-2">
//                 <label className="block text-gray-700 text-sm font-medium">
//                   ចំនួន *
//                 </label>
//                 <input
//                   type="number"
//                   min="0"
//                   value={qty}
//                   onChange={(e) => setQty(e.target.value)}
//                   className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
//                   placeholder="0"
//                   disabled={loading}
//                   required
//                 />
//               </div>

//               <div className="space-y-2">
//                 <label className="block text-gray-700 text-sm font-medium">
//                   លេខកូដ *
//                 </label>
//                 <input
//                   type="text"
//                   value={barcode}
//                   onChange={(e) => setBarcode(e.target.value)}
//                   className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
//                   placeholder="បញ្ចូលលេខកូដ"
//                   disabled={loading}
//                   required
//                 />
//               </div>
//             </div>

//             {/* Image Upload with Preview */}
//             <div className="space-y-3">
//               <label className="block text-gray-700 text-sm font-medium">
//                 រូបភាព
//               </label>

//               {/* Image Preview */}
//               {(image || imagePreview) && (
//                 <div className="mb-3">
//                   <div className="flex items-center justify-between mb-2">
//                     <p className="text-sm text-gray-600">ការមើលជាមុន៖</p>
//                     <button
//                       type="button"
//                       onClick={() => {
//                         setImage("");
//                         setImageFile(null);
//                         setImagePreview("");
//                       }}
//                       className="text-sm text-red-600 hover:text-red-800"
//                       disabled={loading}
//                     >
//                       លុបរូបភាព
//                     </button>
//                   </div>
//                   <div className="relative w-40 h-40 border rounded-lg overflow-hidden">
//                     <img
//                       src={imagePreview || image}
//                       alt="Product preview"
//                       className="w-full h-full object-cover"
//                       onError={(e) => {
//                         e.target.src =
//                           "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOWNhMGIwIj5ObyBpbWFnZTwvdGV4dD48L3N2Zz4=";
//                       }}
//                     />
//                   </div>
//                 </div>
//               )}

//               {/* File Upload */}
//               <div className="space-y-2">
//                 <label className="block text-sm text-gray-600 mb-2">
//                   បង្ហោះរូបភាព:
//                 </label>
//                 <input
//                   type="file"
//                   accept="image/*"
//                   onChange={(e) => {
//                     const file = e.target.files[0];
//                     if (file) {
//                       // Check file size (max 5MB)
//                       if (file.size > 5 * 1024 * 1024) {
//                         setError("រូបភាពត្រូវតែតូចជាង 5MB");
//                         return;
//                       }
                      
//                       setImageFile(file);
                      
//                       // Create preview
//                       const reader = new FileReader();
//                       reader.onloadend = () => {
//                         setImagePreview(reader.result);
//                         // Also set image as base64 for backend
//                         setImage(reader.result);
//                       };
//                       reader.readAsDataURL(file);
//                     }
//                   }}
//                   className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
//                   disabled={loading}
//                 />
//               </div>

//               {/* Or Image URL Input */}
//               {/* <div className="space-y-2">
//                 <label className="block text-sm text-gray-600 mb-2">
//                   ឬបញ្ចូល URL រូបភាព:
//                 </label>
//                 <div className="flex flex-col sm:flex-row gap-2">
//                   <input
//                     type="text"
//                     value={image && !imagePreview ? image : ""}
//                     onChange={(e) => {
//                       setImage(e.target.value);
//                       setImageFile(null);
//                       setImagePreview("");
//                     }}
//                     className="flex-1 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
//                     placeholder="https://example.com/image.jpg"
//                     disabled={loading || !!imagePreview}
//                   />
//                   {image && !imagePreview && (
//                     <button
//                       type="button"
//                       onClick={() => {
//                         if (
//                           image.startsWith("http") ||
//                           image.startsWith("data:")
//                         ) {
//                           window.open(image, "_blank");
//                         }
//                       }}
//                       className="sm:w-auto bg-blue-100 text-blue-700 hover:bg-blue-200 py-3 px-4 rounded-lg text-sm font-medium"
//                       disabled={loading}
//                     >
//                       តេស្តមើល
//                     </button>
//                   )}
//                 </div>
//                 <p className="text-xs text-gray-500">
//                   បង្ហោះរូបភាពពីកុំព្យូទ័រ ឬបញ្ចូល URL រូបភាព។
//                 </p>
//               </div> */}
//             </div>

//             {/* Status & Expire Date */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
//               <div className="space-y-2">
//                 <label className="block text-gray-700 text-sm font-medium">
//                   ស្ថានភាព
//                 </label>
//                 <select
//                   value={status}
//                   onChange={(e) => setStatus(e.target.value)}
//                   className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base bg-white"
//                   disabled={loading}
//                 >
//                   <option value="1">សកម្ម</option>
//                   <option value="0">មិនសកម្ម</option>
//                 </select>
//               </div>

//               <div className="space-y-2">
//                 <label className="block text-gray-700 text-sm font-medium">
//                   ថ្ងៃផុតកំណត់
//                 </label>
//                 <input
//                   type="date"
//                   value={expire_date}
//                   onChange={(e) => setExpireDate(e.target.value)}
//                   className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
//                   disabled={loading}
//                 />
//               </div>
//             </div>

//             {/* Buttons */}
//             <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
//               <button
//                 type="button"
//                 onClick={onClose}
//                 className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-5 rounded-lg font-medium transition duration-200 text-center disabled:opacity-50"
//                 disabled={loading}
//               >
//                 បោះបង់
//               </button>
//               <button
//                 type="submit"
//                 className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white py-3 px-5 rounded-lg font-medium transition duration-200 text-center disabled:opacity-50 disabled:cursor-not-allowed"
//                 disabled={loading}
//               >
//                 {loading ? (
//                   <span className="flex items-center justify-center">
//                     <svg
//                       className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
//                       xmlns="http://www.w3.org/2000/svg"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                     >
//                       <circle
//                         className="opacity-25"
//                         cx="12"
//                         cy="12"
//                         r="10"
//                         stroke="currentColor"
//                         strokeWidth="4"
//                       ></circle>
//                       <path
//                         className="opacity-75"
//                         fill="currentColor"
//                         d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                       ></path>
//                     </svg>
//                     កំពុងរក្សាទុក...
//                   </span>
//                 ) : productId ? (
//                   "រក្សាទុកការកែសម្រួល"
//                 ) : (
//                   "បន្ថែមផលិតផល"
//                 )}
//               </button>
//             </div>
//           </form>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ProductModal;

// src/components/products/ProductModal.jsx
import React, { useState, useEffect } from "react";
import {
  createProduct,
  updateProduct,
  fetchProductById,
} from "../../api/product.api";
import { fetchCategories } from "../../api/category.api";
import { fetchBrands } from "../../api/brand.api";
import { fetchSuppliers } from "../../api/supplier.api";

const ProductModal = ({ isOpen, onClose, productId, refreshProducts }) => {
  const [name, setName] = useState("");
  const [category_id, setCategoryId] = useState("");
  const [brand_id, setBrandId] = useState("");
  const [supplier_id, setSupplierId] = useState("");
  const [price, setPrice] = useState("");
  const [sale_price, setSalePrice] = useState("");
  const [qty, setQty] = useState("");
  const [barcode, setBarcode] = useState("");
  const [image, setImage] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [status, setStatus] = useState(0);
  const [expire_date, setExpireDate] = useState("");
  const [error, setError] = useState(null);
  // State for categories, brands, and suppliers
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch categories, brands, and suppliers
    const fetchData = async () => {
      try {
        setLoading(true);
        const [categoriesData, brandsData, suppliersData] = await Promise.all([
          fetchCategories(),
          fetchBrands(),
          fetchSuppliers(),
        ]);
       
        // API functions already extract the data, but ensure it's an array
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        setBrands(Array.isArray(brandsData) ? brandsData : []);
        setSuppliers(Array.isArray(suppliersData) ? suppliersData : []);
      } catch (error) {
        console.error("Error fetching categories, brands, or suppliers:", error);
        setError("មិនអាចទាញយកទិន្នន័យប្រភេទ ម៉ាក ឬអ្នកផ្គត់ផ្គង់បានទេ");
        // Set empty arrays to prevent undefined errors
        setCategories([]);
        setBrands([]);
        setSuppliers([]);
      } finally {
        setLoading(false);
      }
    };
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (productId && isOpen) {
      const getProduct = async () => {
        try {
          setLoading(true);
          const product = await fetchProductById(productId);
          setName(product.name || "");
          setCategoryId(product.category_id || "");
          setBrandId(product.brand_id || "");
          setSupplierId(product.supplier_id || "");
          setPrice(product.price || "");
          setSalePrice(product.sale_price || "");
          setQty(product.qty || "");
          setBarcode(product.barcode || "");
          // Set image and preview if image exists
          if (product.image) {
            setImage(product.image);
            // If it's a base64 string, also set preview
            if (product.image.startsWith("data:image")) {
              setImagePreview(product.image);
            } else if (product.image.startsWith("http://") || product.image.startsWith("https://")) {
              setImagePreview(product.image);
            } else {
              // If it's stored without prefix, assume it's base64 and add data URL prefix
              setImagePreview(product.image);
            }
          } else {
            setImage("");
            setImagePreview("");
          }
          setStatus(product.status || 0);
          setExpireDate(
            product.expire_date ? product.expire_date.split("T")[0] : ""
          );
        } catch (error) {
          setError("មិនអាចទាញយកព័ត៌មានផលិតផលបានទេ");
          console.error("Error fetching product:", error);
        } finally {
          setLoading(false);
        }
      };
      getProduct();
    } else if (isOpen) {
      // Reset fields for a new product
      resetFields();
    }
  }, [productId, isOpen]);

  const resetFields = () => {
    setName("");
    setCategoryId("");
    setBrandId("");
    setSupplierId("");
    setPrice("");
    setSalePrice("");
    setQty("");
    setBarcode("");
    setImage("");
    setImageFile(null);
    setImagePreview("");
    setStatus(0);
    setExpireDate("");
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    // Validation
    if (!name || !category_id || !brand_id || !supplier_id || !price || !qty || !barcode) {
      setError("សូមបំពេញព័ត៌មានចាំបាច់ទាំងអស់");
      return;
    }
    try {
      setLoading(true);
      const productData = {
        name,
        category_id: parseInt(category_id),
        brand_id: parseInt(brand_id),
        supplier_id: parseInt(supplier_id),
        price: parseFloat(price),
        sale_price: sale_price ? parseFloat(sale_price) : null,
        qty: parseInt(qty),
        barcode,
        image,
        status: parseInt(status),
        expire_date: expire_date || null,
      };
      if (productId) {
        await updateProduct(productId, productData);
      } else {
        await createProduct(productData);
      }
      resetFields();
      if (refreshProducts) refreshProducts();
      onClose();
    } catch (error) {
      console.error("Error saving product:", error);
      setError(
        error.response?.data?.message || "មានបញ្ហាក្នុងការរក្សាទុកផលិតផល"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4 overflow-y-auto z-50">
      <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-md md:max-w-2xl mx-auto my-4 md:my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            {productId ? "កែសម្រួលផលិតផល" : "បន្ថែមផលិតផល"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
            {error}
          </div>
        )}
        {loading && !productId ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">កំពុងផ្ទុក...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
            {/* Product Name */}
            <div className="space-y-2">
              <label className="block text-gray-700 text-sm font-medium">
                ឈ្មោះផលិតផល *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                placeholder="បញ្ចូលឈ្មោះផលិតផល"
                disabled={loading}
              />
            </div>
            {/* Category, Brand & Supplier Dropdowns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {/* Category Dropdown */}
              <div className="space-y-2">
                <label className="block text-gray-700 text-sm font-medium">
                  ប្រភេទផលិតផល *
                </label>
                <div className="relative">
                  <select
                    value={category_id}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base bg-white appearance-none"
                    disabled={loading || !categories || categories.length === 0}
                    required
                  >
                    <option value="">ជ្រើសរើសប្រភេទ</option>
                    {categories && categories.length > 0 && categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                    <svg
                      className="fill-current h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
                {(!categories || categories.length === 0) && !loading && (
                  <p className="text-xs text-red-500">
                    មិនមានប្រភេទផលិតផលទេ។ សូមបន្ថែមប្រភេទមុន។
                  </p>
                )}
              </div>
              {/* Brand Dropdown */}
              <div className="space-y-2">
                <label className="block text-gray-700 text-sm font-medium">
                  ម៉ាក *
                </label>
                <div className="relative">
                  <select
                    value={brand_id}
                    onChange={(e) => setBrandId(e.target.value)}
                    className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base bg-white appearance-none"
                    disabled={loading || !brands || brands.length === 0}
                    required
                  >
                    <option value="">ជ្រើសរើសម៉ាក</option>
                    {brands && brands.length > 0 && brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                    <svg
                      className="fill-current h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
                {(!brands || brands.length === 0) && !loading && (
                  <p className="text-xs text-red-500">
                    មិនមានម៉ាកទេ។ សូមបន្ថែមម៉ាកមុន។
                  </p>
                )}
              </div>
              {/* Supplier Dropdown */}
              <div className="space-y-2">
                <label className="block text-gray-700 text-sm font-medium">
                  អ្នកផ្គត់ផ្គង់ *
                </label>
                <div className="relative">
                  <select
                    value={supplier_id}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base bg-white appearance-none"
                    disabled={loading || !suppliers || suppliers.length === 0}
                    required
                  >
                    <option value="">ជ្រើសរើសអ្នកផ្គត់ផ្គង់</option>
                    {suppliers && suppliers.length > 0 && suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                    <svg
                      className="fill-current h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
                {(!suppliers || suppliers.length === 0) && !loading && (
                  <p className="text-xs text-red-500">
                    មិនមានអ្នកផ្គត់ផ្គង់ទេ។ សូមបន្ថែមអ្នកផ្គត់ផ្គង់មុន។
                  </p>
                )}
              </div>
            </div>
            {/* Price & Sale Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <label className="block text-gray-700 text-sm font-medium">
                  តម្លៃ *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="border border-gray-300 rounded-lg p-3 w-full pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                    placeholder="0.00"
                    disabled={loading}
                    required
                  />
                  <span className="absolute left-3 top-3.5 text-gray-500">
                    $
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-gray-700 text-sm font-medium">
                  តម្លៃលក់
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={sale_price}
                    onChange={(e) => setSalePrice(e.target.value)}
                    className="border border-gray-300 rounded-lg p-3 w-full pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                    placeholder="0.00"
                    disabled={loading}
                  />
                  <span className="absolute left-3 top-3.5 text-gray-500">
                    $
                  </span>
                </div>
              </div>
            </div>
            {/* Quantity & Barcode */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <label className="block text-gray-700 text-sm font-medium">
                  ចំនួន *
                </label>
                <input
                  type="number"
                  min="0"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  placeholder="0"
                  disabled={loading}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-gray-700 text-sm font-medium">
                  លេខកូដ *
                </label>
                <input
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  placeholder="បញ្ចូលលេខកូដ"
                  disabled={loading}
                  required
                />
              </div>
            </div>
            {/* Image Upload with Preview */}
            <div className="space-y-3">
              <label className="block text-gray-700 text-sm font-medium">
                រូបភាព
              </label>
              {/* Image Preview */}
              {(image || imagePreview) && (
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-600">ការមើលជាមុន៖</p>
                    <button
                      type="button"
                      onClick={() => {
                        setImage("");
                        setImageFile(null);
                        setImagePreview("");
                      }}
                      className="text-sm text-red-600 hover:text-red-800"
                      disabled={loading}
                    >
                      លុបរូបភាព
                    </button>
                  </div>
                  <div className="relative w-40 h-40 border rounded-lg overflow-hidden">
                    <img
                      src={imagePreview || image}
                      alt="Product preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src =
                          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOWNhMGIwIj5ObyBpbWFnZTwvdGV4dD48L3N2Zz4=";
                      }}
                    />
                  </div>
                </div>
              )}
              {/* File Upload */}
              <div className="space-y-2">
                <label className="block text-sm text-gray-600 mb-2">
                  បង្ហោះរូបភាព:
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      // Check file size (max 5MB)
                      if (file.size > 5 * 1024 * 1024) {
                        setError("រូបភាពត្រូវតែតូចជាង 5MB");
                        return;
                      }
                     
                      setImageFile(file);
                     
                      // Create preview
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setImagePreview(reader.result);
                        // Also set image as base64 for backend
                        setImage(reader.result);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  disabled={loading}
                />
              </div>
            </div>
            {/* Status & Expire Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <label className="block text-gray-700 text-sm font-medium">
                  ស្ថានភាព
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base bg-white"
                  disabled={loading}
                >
                  <option value="1">សកម្ម</option>
                  <option value="0">មិនសកម្ម</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-gray-700 text-sm font-medium">
                  ថ្ងៃផុតកំណត់
                </label>
                <input
                  type="date"
                  value={expire_date}
                  onChange={(e) => setExpireDate(e.target.value)}
                  className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  disabled={loading}
                />
              </div>
            </div>
            {/* Buttons */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-5 rounded-lg font-medium transition duration-200 text-center disabled:opacity-50"
                disabled={loading}
              >
                បោះបង់
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white py-3 px-5 rounded-lg font-medium transition duration-200 text-center disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    កំពុងរក្សាទុក...
                  </span>
                ) : productId ? (
                  "រក្សាទុកការកែសម្រួល"
                ) : (
                  "បន្ថែមផលិតផល"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProductModal;
