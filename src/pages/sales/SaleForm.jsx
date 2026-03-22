// src/pages/sales/SaleForm.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchSales, createSale, updateSale } from "../../api/sale.api";
import { fetchCustomers } from "../../api/customer.api";
import { fetchProducts } from "../../api/product.api";

const SaleForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    customer_id: "",
    items: [{ product_id: "", quantity: 1, unit_price: "" }],
    discount: 0,
    paid: 0,
  });
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadCustomers();
    loadProducts();
    if (id) {
      loadSale();
    }
  }, [id]);

  const loadCustomers = async () => {
    try {
      const response = await fetchCustomers();
      const customersData = response?.data || response || [];
      setCustomers(Array.isArray(customersData) ? customersData : []);
    } catch (error) {
      console.error("Error loading customers:", error);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await fetchProducts();
      const productsData =
        response?.product || response?.data || response || [];
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (error) {
      console.error("Error loading products:", error);
    }
  };

  const loadSale = async () => {
    try {
      setLoading(true);
      const response = await fetchSales();
      const salesData = response?.data || response || [];
      const sale = salesData.find((s) => s.id === parseInt(id));

      if (sale) {
        setFormData({
          customer_id: sale.customer_id || "",
          items: sale.items || [
            { product_id: "", quantity: 1, unit_price: "" },
          ],
          discount: sale.discount || 0,
          paid: sale.paid || 0,
        });
      }
    } catch (error) {
      console.error("Error loading sale:", error);
      setError("Failed to load sale data");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "discount" || name === "paid" ? parseFloat(value) : value,
    }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;

    // Auto-populate unit_price if product is selected
    if (field === "product_id") {
      const selectedProduct = products.find((p) => p.id === parseInt(value));
      if (selectedProduct) {
        newItems[index].unit_price = selectedProduct.sale_price;
      }
    }

    setFormData((prev) => ({
      ...prev,
      items: newItems,
    }));
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { product_id: "", quantity: 1, unit_price: "" }],
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData((prev) => ({
        ...prev,
        items: newItems,
      }));
    }
  };

  const calculateSubtotal = (item) => {
    const quantity = parseFloat(item.quantity) || 0;
    const unitPrice = parseFloat(item.unit_price) || 0;
    return quantity * unitPrice;
  };

  const calculateTotal = () => {
    const subtotal = formData.items.reduce(
      (sum, item) => sum + calculateSubtotal(item),
      0
    );
    const discount = parseFloat(formData.discount) || 0;
    return subtotal - discount;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const saleData = {
        ...formData,
        items: formData.items.map((item) => ({
          product_id: parseInt(item.product_id),
          quantity: parseInt(item.quantity),
          unit_price: parseFloat(item.unit_price),
        })),
        discount: parseFloat(formData.discount),
        paid: parseFloat(formData.paid),
      };

      if (id) {
        // Update existing sale
        await updateSale(id, saleData);
      } else {
        // Create new sale
        await createSale(saleData);
      }

      navigate("/sales");
    } catch (error) {
      console.error("Error saving sale:", error);
      setError(error.response?.data?.message || "Failed to save sale");
    } finally {
      setLoading(false);
    }
  };

  const total = calculateTotal();
  const amountDue = total - parseFloat(formData.paid);

  if (loading && id) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Filter products based on search term
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">
            {id ? "Edit Sale" : "New Sale"}
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            {id ? "Update sale information" : "Process a new sale transaction"}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Customer Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer
            </label>
            <select
              name="customer_id"
              value={formData.customer_id}
              onChange={handleInputChange}
              className="w-full md:w-1/2 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Walk-in Customer (Cash)</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} - {customer.phone || "No phone"}
                </option>
              ))}
            </select>
          </div>

          {/* Sale Items */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
              <h3 className="text-lg font-medium text-gray-800">Items</h3>
              <button
                type="button"
                onClick={addItem}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium w-full sm:w-auto"
              >
                + Add Item
              </button>
            </div>

            {formData.items.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-1 lg:grid-cols-12 gap-3 mb-3 p-3 border border-gray-200 rounded-lg bg-gray-50"
              >
                <div className="lg:col-span-5">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Product
                  </label>
                  <input
                    type="text"
                    placeholder="Search product..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 mb-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={item.product_id}
                    onChange={(e) => {
                      handleItemChange(index, "product_id", e.target.value);
                      setSearchTerm(""); // Clear search after selection
                    }}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Product</option>
                    {filteredProducts.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} - ${product.sale_price} (Qty:{" "}
                        {product.qty})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Qty
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={
                      item.product_id
                        ? products.find(
                            (p) => p.id === parseInt(item.product_id)
                          )?.qty || Infinity
                        : Infinity
                    }
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(index, "quantity", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                   Sale Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.unit_price}
                    onChange={(e) =>
                      handleItemChange(index, "unit_price", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Subtotal
                  </label>
                  <div className="bg-gray-100 p-2 rounded-lg text-sm font-medium">
                    ${calculateSubtotal(item).toFixed(2)}
                  </div>
                </div>

                <div className="lg:col-span-1 flex items-end">
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="w-full bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg text-sm"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Summary Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subtotal
              </label>
              <div className="text-lg font-bold text-gray-900">
                $
                {formData.items
                  .reduce((sum, item) => sum + calculateSubtotal(item), 0)
                  .toFixed(2)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.discount}
                onChange={handleInputChange}
                name="discount"
                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total
              </label>
              <div className="text-lg font-bold text-blue-600">
                ${total.toFixed(2)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount Due
              </label>
              <div
                className={`text-lg font-bold ${
                  amountDue > 0 ? "text-red-600" : "text-green-600"
                }`}
              >
                ${Math.abs(amountDue).toFixed(2)}{" "}
                {amountDue > 0 ? "Owed" : "Change"}
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount Paid ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.paid}
                  onChange={handleInputChange}
                  name="paid"
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 min-w-[150px] bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Processing..." : id ? "Update Sale" : "Complete Sale"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/sales")}
              className="flex-1 min-w-[150px] bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SaleForm;
