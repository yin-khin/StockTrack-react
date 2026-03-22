// src/pages/payments/PaymentForm.jsx
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { createPayment, updatePayment, fetchPaymentById } from "../../api/payment.api";
import { fetchSales } from "../../api/sale.api";

const PaymentForm = ({ isOpen, onClose, onSuccess, paymentId = null }) => {
  const [formData, setFormData] = useState({
    sale_id: "",
    amount: "",
    method: "cash"
  });
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isEdit = !!paymentId; // true បើជា edit mode

  const paymentMethods = [
    { value: "cash", label: "សាច់ប្រាក់" },
    { value: "credit_card", label: "កាតឥណទាន" },
    { value: "bank_transfer", label: "ផ្ទេរប្រាក់តាមធនាគារ" }
  ];

  useEffect(() => {
    if (isOpen) {
      loadSales();
      if (isEdit) {
        loadPayment();
      } else {
        resetForm();
      }
    }
  }, [isOpen, paymentId]);

  const loadSales = async () => {
    try {
      const data = await fetchSales();
      const allSales = Array.isArray(data) ? data : data?.data || [];

      // Filter: បង្ហាញតែការលក់ដែលនៅសល់ត្រូវបង់ (balance > 0)
      // បើជា edit mode → អនុញ្ញាតឲ្យមើលឃើញទាំងអស់ (ដើម្បីកែបាន)
      const filteredSales = isEdit 
        ? allSales 
        : allSales.filter(sale => parseFloat(sale.balance || 0) > 0);

      setSales(filteredSales);
    } catch (error) {
      console.error("Error loading sales:", error);
      setSales([]);
      setError("មិនអាចទាញយកទិន្នន័យការលក់បានទេ");
    }
  };

  const loadPayment = async () => {
    try {
      setLoading(true);
      const data = await fetchPaymentById(paymentId);
      setFormData({
        sale_id: data.sale_id?.toString() || "",
        amount: data.amount?.toString() || "",
        method: data.method || "cash"
      });
    } catch (error) {
      console.error("Error loading payment:", error);
      setError("មិនអាចទាញយកទិន្នន័យការទូទាត់បានទេ");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      sale_id: "",
      amount: "",
      method: "cash"
    });
    setError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // បើជ្រើសរើសការលក់ → បំពេញចំនួនទឹកប្រាក់ស្វ័យប្រវត្តិ
    if (name === "sale_id" && value) {
      const selectedSale = sales.find(sale => sale.id.toString() === value);
      if (selectedSale) {
        const balance = parseFloat(selectedSale.balance || 0);
        setFormData(prev => ({
          ...prev,
          sale_id: value,
          amount: balance > 0 ? balance.toFixed(2) : ""
        }));
        return;
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.sale_id) {
      setError("សូមជ្រើសរើសការលក់ជាមុន");
      return;
    }

    const amountNum = parseFloat(formData.amount);
    if (!formData.amount || isNaN(amountNum) || amountNum <= 0) {
      setError("សូមបញ្ចូលចំនួនទឹកប្រាក់ត្រឹមត្រូវ (ច្រើនជាង 0)");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const paymentData = {
        sale_id: formData.sale_id,
        amount: amountNum,
        method: formData.method
      };

      let response;
      if (isEdit) {
        response = await updatePayment(paymentId, paymentData);
      } else {
        response = await createPayment(paymentData);
      }

      if (response?.success) {
        alert(isEdit ? "កែសម្រួលការទូទាត់ជោគជ័យ!" : "បន្ថែមការទូទាត់ជោគជ័យ!");
        onSuccess?.();
        onClose();
      } else {
        setError(response?.message || "មានបញ្ហាក្នុងការរក្សាទុក");
      }
    } catch (error) {
      console.error("Error saving payment:", error);
      setError(
        error.response?.data?.message || 
        `មិនអាច${isEdit ? "កែសម្រួល" : "បន្ថែម"}ការទូទាត់បានទេ`
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <h3 className="text-xl font-bold text-gray-800">
            {isEdit ? "កែសម្រួលការទូទាត់" : "បន្ថែមការទូទាត់ថ្មី"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Sale Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ការលក់ (ជម្រើស) *
            </label>
            <select
              name="sale_id"
              value={formData.sale_id}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              required
              disabled={loading}
            >
              <option value="">ជ្រើសរើសការលក់</option>
              {sales.length === 0 ? (
                <option value="" disabled>
                  {isEdit ? "កំពុងផ្ទុក..." : "គ្មានការលក់ដែលនៅសល់ត្រូវបង់"}
                </option>
              ) : (
                sales.map((sale) => {
                  const balance = parseFloat(sale.balance || 0);
                  return (
                    <option key={sale.id} value={sale.id}>
                      #{sale.id} - អតិថិជន: {sale.Customer?.name || "Walk-in"}
                      {balance > 0 
                        ? ` (នៅសល់: $${balance.toFixed(2)})` 
                        : " (បានបង់រួច)"}
                    </option>
                  );
                })
              )}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ចំនួនទឹកប្រាក់ *
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              step="0.01"
              min="0.01"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00"
              required
              disabled={loading}
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              វិធីសាស្ត្រទូទាត់ *
            </label>
            <select
              name="method"
              value={formData.method}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              required
              disabled={loading}
            >
              {paymentMethods.map((method) => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              បោះបង់
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
            >
              {loading 
                ? "កំពុងរក្សាទុក..." 
                : isEdit 
                  ? "កែសម្រួល" 
                  : "បន្ថែមការទូទាត់"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentForm;