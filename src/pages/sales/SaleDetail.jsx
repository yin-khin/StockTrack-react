// src/pages/sales/SaleDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSaleById } from "../../api/sale.api";
import { ArrowLeft, User, Calendar, DollarSign, Package } from "lucide-react";

const SaleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSaleDetail();
  }, [id]);

  const loadSaleDetail = async () => {
    try {
      setLoading(true);
      const response = await getSaleById(id);
      const saleData = response?.data || response;
      setSale(saleData);
    } catch (error) {
      console.error("Error loading sale:", error);
      setError("Failed to load sale details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !sale) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error || "Sale not found"}</p>
          <button
            onClick={() => navigate("/sales")}
            className="mt-4 text-blue-600 hover:underline"
          >
            ត្រឡប់ទៅបញ្ជីការលក់
          </button>
        </div>
      </div>
    );
  }

  const customerName = sale.Customer?.name || "Walk-in Customer";
  const saleItems = sale.SaleItems || [];

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/sales")}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            ព័ត៌មានលម្អិតការលក់ #{sale.id}
          </h2>
          <p className="text-gray-600 text-sm mt-1">Sale Details</p>
        </div>
      </div>

      {/* Sale Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Customer & Date Info */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            ព័ត៌មានទូទៅ
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">អតិថិជន</p>
                <p className="font-medium text-gray-900">{customerName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">កាលបរិច្ឆេទ</p>
                <p className="font-medium text-gray-900">
                  {new Date(sale.sale_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            ព័ត៌មានទូទាត់
          </h3>
          <div className="space-y-3">
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">បញ្ចុះតម្លៃ:</span>
              <span className="font-medium text-gray-900">
                ${parseFloat(sale.discount || 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">តម្លៃត្រូវបង់:</span>
              <span className="font-semibold text-blue-600">
                ${parseFloat(sale.total || 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">បានទូទាត់:</span>
              <span className="font-medium text-green-600">
                ${parseFloat(sale.paid || 0).toFixed(2)}
              </span>
            </div>
            <div className="border-t pt-3 flex justify-between items-center">
              <span className="text-gray-600 font-medium">នៅសល់:</span>
              <span
                className={`font-bold text-lg ${
                  parseFloat(sale.balance || 0) > 0
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                ${parseFloat(sale.balance || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sale Items */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Package className="h-5 w-5" />
          ផលិតផលដែលបានលក់
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  ផលិតផល
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  បរិមាណ
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  តម្លៃឯកតា
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {/* សរុប */}
                  បញ្ចុះតម្លៃ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {saleItems.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                    គ្មានផលិតផល
                  </td>
                </tr>
              ) : (
                saleItems.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      {item.Product?.name || "Unknown Product"}
                    </td>
                    <td className="px-4 py-3 text-sm">{item.quantity}</td>
                    <td className="px-4 py-3 text-sm">
                      ${parseFloat(item.unit_price || 0).toFixed(2)}
                       {/* ${parseFloat(sale.discount || 0).toFixed(2)} */}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-blue-600">
                      $
                      {(
                        parseFloat(item.quantity || 0) *
                        parseFloat(sale.discount || 0)
                      ).toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={() => navigate("/sales")}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          ត្រឡប់ក្រោយ
        </button>
      </div>
    </div>
  );
};

export default SaleDetail;
