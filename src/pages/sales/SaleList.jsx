// src/pages/sales/SaleList.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchSales, deleteSale } from "../../api/sale.api";
import { fetchCustomers } from "../../api/customer.api";
import {
  Eye,
  Trash2,
  XCircle,
  Plus,
  Search,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Package,
} from "lucide-react";
import { AdminOnly, can } from "../../utils/permissions";
import { useAuth } from "../../context/AuthContext";

const ITEMS_PER_PAGE = 10;

const SaleList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [deleting, setDeleting] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Permission checks
  const canCreate = can(user, "sale", "create");
  const canEdit = can(user, "sale", "edit");
  const canDelete = can(user, "sale", "delete");
  const canCancel = can(user, "sale", "cancel");

  useEffect(() => {
    loadSales();
    loadCustomers();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const loadSales = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchSales();
      const salesData = response?.data || response || [];
      setSales(Array.isArray(salesData) ? salesData : []);
    } catch (err) {
      console.error("Error loading sales:", err);
      setError("មិនអាចទាញយកទិន្នន័យការលក់បានទេ");
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await fetchCustomers();
      const customersData = response?.data || response || [];
      setCustomers(Array.isArray(customersData) ? customersData : []);
    } catch (err) {
      console.error("Error loading customers:", err);
    }
  };

  const getCustomerName = (customerId) => {
    const customer = customers.find((c) => c.id === customerId);
    return customer ? customer.name : "Walk-in";
  };

  // Calculate total quantity from sale items
  const getTotalQuantity = (sale) => {
    if (!sale.SaleItems || !Array.isArray(sale.SaleItems)) return 0;
    return sale.SaleItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
  };

  const handleView = (saleId) => navigate(`/sales/${saleId}`);

  const handleDelete = async (saleId) => {
    if (
      !window.confirm(
        "តើអ្នកប្រាកដថាចង់លុបការលក់នេះទេ?\n\nការលុបនឹងធ្វើឱ្យស្តុកត្រឡប់មកវិញ។",
      )
    ) {
      return;
    }

    try {
      setDeleting(saleId);
      const res = await deleteSale(saleId);

      if (res?.success) {
        await loadSales();
      } else {
        alert(res?.message || "Delete failed");
      }
    } catch (err) {
      console.error("Error deleting sale:", err);
      alert("មិនអាចលុបការលក់បានទេ");
    } finally {
      setDeleting(null);
    }
  };

  const handleCancel = (saleId) => {
    if (window.confirm("តើអ្នកចង់បោះបង់ការលក់នេះទេ?\n\nស្តុកនឹងត្រឡប់មកវិញ។")) {
      handleDelete(saleId);
    }
  };

  const filteredSales = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return sales;

    return sales.filter((sale) => {
      const idStr = String(sale.id || "");
      const totalStr = String(sale.total || "");
      const customerName = getCustomerName(sale.customer_id).toLowerCase();

      return (
        idStr.includes(q) || totalStr.includes(q) || customerName.includes(q)
      );
    });
  }, [sales, searchTerm, customers]);

  const totalItems = filteredSales.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
    if (currentPage < 1) setCurrentPage(1);
  }, [currentPage, totalPages]);

  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredSales.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredSales, currentPage]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalRevenue = sales.reduce(
      (sum, sale) => sum + Number(sale.total || 0),
      0,
    );
    const totalPaid = sales.reduce(
      (sum, sale) => sum + Number(sale.paid || 0),
      0,
    );
    const totalBalance = sales.reduce(
      (sum, sale) => sum + Number(sale.balance || 0),
      0,
    );
    const totalQty = sales.reduce(
      (sum, sale) => sum + getTotalQuantity(sale),
      0,
    );

    return { totalRevenue, totalPaid, totalBalance, totalQty };
  }, [sales]);

  const hasActions = canEdit || canDelete || canCancel;

  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return;
    setCurrentPage(p);
  };

  const renderPageButtons = () => {
    const pages = [];
    const maxButtons = 7;

    if (totalPages <= maxButtons) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    const left = Math.max(1, currentPage - 1);
    const right = Math.min(totalPages, currentPage + 1);

    pages.push(1);
    if (left > 2) pages.push("...");
    for (let i = left; i <= right; i++) {
      if (i !== 1 && i !== totalPages) pages.push(i);
    }
    if (right < totalPages - 1) pages.push("...");
    pages.push(totalPages);

    return pages;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <ShoppingCart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                ការលក់ទាំងអស់
              </h1>
              <p className="text-gray-600 text-sm">គ្រប់គ្រងកំណត់ត្រាការលក់</p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">ចំណូលសរុប</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${stats.totalRevenue.toFixed(2)}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">បានបង់</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${stats.totalPaid.toFixed(2)}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">នៅសល់</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${stats.totalBalance.toFixed(2)}
                </p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">ចំនួនសរុប</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalQty}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search & Actions */}
        <div className="bg-white rounded-xl shadow-md p-5 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="ស្វែងរកតាម ID, អតិថិជន ឬចំនួនទឹកប្រាក់..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {canCreate && (
              <button
                onClick={() => navigate("/sales/new")}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Plus className="h-5 w-5" />
                ការលក់ថ្មី
              </button>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg text-red-700 flex items-center gap-3">
            <XCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600 font-medium">
              កំពុងទាញយកទិន្នន័យ...
            </p>
          </div>
        ) : totalItems === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              គ្មានការលក់
            </h3>
            <p className="text-gray-600 mb-6">
              {canCreate
                ? "ចាប់ផ្តើមដោយបង្កើតការលក់ថ្មី"
                : "មិនមានការលក់សម្រាប់អ្នកប្រើប្រាស់នេះទេ"}
            </p>
            {canCreate && (
              <button
                onClick={() => navigate("/sales/new")}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-medium shadow-lg transition-all"
              >
                <Plus className="h-5 w-5 mr-2" />
                បង្កើតការលក់ថ្មី
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      ថ្ងៃខែ
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      អតិថិជន
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      ចំនួន
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      បញ្ចុះតម្លៃ
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      សរុប
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      បានបង់
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      នៅសល់
                    </th>
                    {hasActions && (
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        សកម្មភាព
                      </th>
                    )}
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-100">
                  {pageItems.map((sale, index) => (
                    <tr
                      key={sale.id}
                      className={`hover:bg-blue-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm font-bold rounded-lg">
                          #{sale.id}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                        {sale.sale_date
                          ? new Date(sale.sale_date).toLocaleDateString("km-KH")
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {getCustomerName(sale.customer_id).charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {getCustomerName(sale.customer_id)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 text-sm font-bold rounded-lg">
                          <Package className="h-4 w-4" />
                          {getTotalQuantity(sale)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-sm font-semibold text-red-600">
                          -${Number(sale.discount || 0).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-base font-bold text-blue-700">
                          ${Number(sale.total || 0).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-sm font-semibold text-green-600">
                          ${Number(sale.paid || 0).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span
                          className={`inline-flex items-center px-3 py-1 text-sm font-bold rounded-lg shadow-sm ${
                            Number(sale.balance || 0) > 0
                              ? "bg-gradient-to-r from-red-500 to-pink-500 text-white"
                              : "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                          }`}
                        >
                          ${Number(sale.balance || 0).toFixed(2)}
                        </span>
                      </td>

                      {hasActions && (
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <AdminOnly>
                              <button
                                onClick={() => handleView(sale.id)}
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all transform hover:scale-110"
                                title="មើលលម្អិត"
                              >
                                <Eye className="h-5 w-5" />
                              </button>

                              {canCancel && Number(sale.balance || 0) > 0 && (
                                <button
                                  onClick={() => handleCancel(sale.id)}
                                  disabled={deleting === sale.id}
                                  className="p-2 text-orange-600 hover:bg-orange-100 rounded-lg transition-all transform hover:scale-110 disabled:opacity-50"
                                  title="បោះបង់ការលក់"
                                >
                                  {deleting === sale.id ? (
                                    <div className="h-5 w-5 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                                  ) : (
                                    <XCircle className="h-5 w-5" />
                                  )}
                                </button>
                              )}

                              {canDelete && (
                                <button
                                  onClick={() => handleDelete(sale.id)}
                                  disabled={deleting === sale.id}
                                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all transform hover:scale-110 disabled:opacity-50"
                                  title="លុប"
                                >
                                  {deleting === sale.id ? (
                                    <div className="h-5 w-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                  ) : (
                                    <Trash2 className="h-5 w-5" />
                                  )}
                                </button>
                              )}
                            </AdminOnly>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between border-t bg-gradient-to-r from-gray-50 to-gray-100 gap-3">
                <div className="text-sm text-gray-700 font-medium">
                  បង្ហាញ{" "}
                  <span className="font-bold text-blue-600">
                    {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                    {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}
                  </span>{" "}
                  នៃ{" "}
                  <span className="font-bold text-blue-600">{totalItems}</span>{" "}
                  ការលក់
                </div>

                <nav className="flex items-center gap-1 flex-wrap justify-center">
                  <button
                    onClick={() => goToPage(1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    « ដើម
                  </button>

                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    មុន
                  </button>

                  {renderPageButtons().map((p, idx) =>
                    p === "..." ? (
                      <span
                        key={`dots-${idx}`}
                        className="px-2 text-gray-500 font-bold"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => goToPage(p)}
                        className={`px-4 py-2 border rounded-lg text-sm font-medium transition-all transform hover:scale-105 ${
                          currentPage === p
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-600 shadow-lg"
                            : "border-gray-300 bg-white text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"
                        }`}
                      >
                        {p}
                      </button>
                    ),
                  )}

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    បន្ទាប់
                  </button>

                  <button
                    onClick={() => goToPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    ចុង »
                  </button>
                </nav>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SaleList;
