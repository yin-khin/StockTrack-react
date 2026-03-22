

import React, { useState, useEffect } from "react";
import { fetchProducts } from "../../../api/product.api";
import {
  Package,
  DollarSign,
  Calendar,
  AlertCircle,
  ShoppingCart,
  TrendingUp,
  X,
  Check,
  Trash2,
} from "lucide-react";

const PurchaseItemForm = ({
  item = {},
  onSave,
  onCancel,
  onDelete,
  isEditing = false,
}) => {
  const [formData, setFormData] = useState({
    product_id: "",
    qty: "",
    cost_price: "",
    sale_price: "",
    manufacture_date: "",
    expire_date: "",
  });

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    if (isEditing && item) {
      setFormData({
        product_id: item.product_id || "",
        qty: item.qty || "",
        cost_price: item.cost_price || "",
        sale_price: item.sale_price || "",
        manufacture_date: item.manufacture_date || "",
        expire_date: item.expire_date || "",
      });
    }
  }, [item, isEditing]);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (formData.product_id) {
      const product = products.find(
        (p) => p.id === parseInt(formData.product_id),
      );
      setSelectedProduct(product);

      // Auto-fill prices if available
      if (product && !isEditing) {
        setFormData((prev) => ({
          ...prev,
          cost_price: prev.cost_price || product.price?.cost_price || "",
          sale_price: prev.sale_price || product.price?.sale_price || "",
        }));
      }
    } else {
      setSelectedProduct(null);
    }
  }, [formData.product_id, products, isEditing]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await fetchProducts();
      setProducts(data.products || data || []);
    } catch (err) {
      setError("មិនអាចទាញយកបញ្ជីផលិតផលបានទេ");
      console.error("Error loading products:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (
      !formData.product_id ||
      !formData.qty ||
      !formData.cost_price ||
      !formData.sale_price
    ) {
      setError("សូមបំពេញព័ត៌មានដែលចាំបាច់ទាំងអស់");
      return;
    }

    if (parseFloat(formData.qty) <= 0) {
      setError("ចំនួនត្រូវតែធំជាង 0");
      return;
    }

    if (parseFloat(formData.cost_price) <= 0) {
      setError("តម្លៃដើមត្រូវតែធំជាង 0");
      return;
    }

    if (parseFloat(formData.sale_price) <= 0) {
      setError("តម្លៃលក់ត្រូវតែធំជាង 0");
      return;
    }

    // Check if manufacture date is before expiry date
    if (formData.manufacture_date && formData.expire_date) {
      if (
        new Date(formData.manufacture_date) > new Date(formData.expire_date)
      ) {
        setError("ថ្ងៃផលិតត្រូវតែមុនថ្ងៃផុតកំណត់");
        return;
      }
    }

    onSave({
      ...formData,
      qty: parseFloat(formData.qty),
      cost_price: parseFloat(formData.cost_price),
      sale_price: parseFloat(formData.sale_price),
    });
  };

  const calculateTotal = () => {
    const qty = parseFloat(formData.qty) || 0;
    const price = parseFloat(formData.cost_price) || 0;
    return (qty * price).toFixed(2);
  };

  const calculateProfit = () => {
    const costPrice = parseFloat(formData.cost_price) || 0;
    const salePrice = parseFloat(formData.sale_price) || 0;
    return (salePrice - costPrice).toFixed(2);
  };

  const calculateProfitMargin = () => {
    const costPrice = parseFloat(formData.cost_price) || 0;
    const salePrice = parseFloat(formData.sale_price) || 0;
    if (costPrice === 0) return 0;
    return (((salePrice - costPrice) / costPrice) * 100).toFixed(1);
  };

  return (
    <div className="border-2 border-gray-200 rounded-xl p-6 mb-4 bg-gradient-to-br from-white to-gray-50 shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center shadow-md">
          <ShoppingCart className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            {isEditing ? "កែប្រែទំនិញ" : "បន្ថែមទំនិញ"}
          </h3>
          <p className="text-xs text-gray-500">បំពេញព័ត៌មានទំនិញទិញចូល</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg text-red-700 flex items-center gap-3 animate-shake">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
            <button
              type="button"
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Product Selection */}
          <div className="lg:col-span-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Package className="h-4 w-4 text-orange-600" />
              ផលិតផល *
            </label>
            <select
              name="product_id"
              value={formData.product_id}
              onChange={handleChange}
              className="w-full border-2 border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white transition-all hover:border-orange-300"
              required
              disabled={loading}
            >
              <option value="">-- ជ្រើសរើសផលិតផល --</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} | តម្លៃ: $ cost:
                  {product.price?.cost_price || product.price || "N/A"} || sale:
                  {product.sale_price || product.price} | ស្តុក:{" "}
                  {product.qty || 0}
                </option>
              ))}
            </select>

            {/* Selected Product Info */}
            {/* {selectedProduct && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-gray-600">ឈ្មោះ:</span>
                    <p className="font-semibold text-gray-900">
                      {selectedProduct.name}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">ស្តុកបច្ចុប្បន្ន:</span>
                    <p className="font-semibold text-blue-600">
                      {selectedProduct.qty || 0}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">តម្លៃដើម:</span>
                    <p className="font-semibold text-orange-600">
                      ${selectedProduct.price?.cost_price || "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">តម្លៃលក់:</span>
                    <p className="font-semibold text-green-600">
                      ${selectedProduct.sale_price || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            )} */}
          </div>

          {/* Quantity */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Package className="h-4 w-4 text-purple-600" />
              ចំនួន *
            </label>
            <input
              type="number"
              name="qty"
              value={formData.qty}
              onChange={handleChange}
              min="1"
              step="1"
              className="w-full border-2 border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all hover:border-purple-300"
              placeholder="0"
              required
              disabled={loading}
            />
          </div>

          {/* Cost Price */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <DollarSign className="h-4 w-4 text-orange-600" />
              តម្លៃដើម *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
                $
              </span>
              <input
                type="number"
                name="cost_price"
                value={formData.cost_price}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full pl-8 pr-3 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all hover:border-orange-300"
                placeholder="0.00"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Sale Price */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              តម្លៃលក់ *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
                $
              </span>
              <input
                type="number"
                name="sale_price"
                value={formData.sale_price}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full pl-8 pr-3 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all hover:border-green-300"
                placeholder="0.00"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Manufacture Date */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              ថ្ងៃផលិត
            </label>
            <input
              type="date"
              name="manufacture_date"
              value={formData.manufacture_date}
              onChange={handleChange}
              className="w-full border-2 border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-blue-300"
              disabled={loading}
            />
          </div>

          {/* Expiry Date */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Calendar className="h-4 w-4 text-red-600" />
              ថ្ងៃផុតកំណត់
            </label>
            <input
              type="date"
              name="expire_date"
              value={formData.expire_date}
              onChange={handleChange}
              className="w-full border-2 border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all hover:border-red-300"
              disabled={loading}
            />
          </div>
        </div>

        {/* Calculation Summary */}
        {formData.qty && formData.cost_price && formData.sale_price && (
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl">
            <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              សង្ខេប
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                <p className="text-xs text-gray-600 mb-1">សរុបតម្លៃដើម</p>
                <p className="text-lg font-bold text-orange-600">
                  ${calculateTotal()}
                </p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                <p className="text-xs text-gray-600 mb-1">ចំណេញក្នុងមួយឯកតា</p>
                <p
                  className={`text-lg font-bold ${parseFloat(calculateProfit()) >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  ${calculateProfit()}
                </p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                <p className="text-xs text-gray-600 mb-1">អត្រាចំណេញ</p>
                <p
                  className={`text-lg font-bold ${parseFloat(calculateProfitMargin()) >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {calculateProfitMargin()}%
                </p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                <p className="text-xs text-gray-600 mb-1">ចំណេញសរុប</p>
                <p
                  className={`text-lg font-bold ${parseFloat(calculateProfit()) * parseFloat(formData.qty) >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  $
                  {(
                    parseFloat(calculateProfit()) * parseFloat(formData.qty)
                  ).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 pt-6 border-t-2 border-gray-200">
          {isEditing && onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:from-red-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium"
            >
              <Trash2 className="h-4 w-4" />
              លុប
            </button>
          )}
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-medium"
          >
            <X className="h-4 w-4" />
            បោះបង់
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="h-4 w-4" />
            {isEditing ? "កែប្រែទំនិញ" : "បន្ថែមទំនិញ"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PurchaseItemForm;
