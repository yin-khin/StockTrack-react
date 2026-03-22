/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
// src/pages/reports/ImportReport.jsx
import React, { useState, useEffect } from "react";
import {
  getImportsReport,
  exportImportReportExcel,
  exportImportReportPDF,
  downloadFile,
} from "../../api/report.api";
import { fetchSuppliers } from "../../api/supplier.api";
import {
  FileText,
  Calendar,
  Filter,
  // eslint-disable-next-line no-unused-vars
  Download,
  FileSpreadsheet,
  FilePlus,
  Search,
  RefreshCw,
  X,
  TrendingUp,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Package,
  Users,
  BarChart3,
} from "lucide-react";

const ITEMS_PER_PAGE = 10;

const ImportReport = () => {
  const [imports, setImports] = useState([]);
  const [filteredImports, setFilteredImports] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [exporting, setExporting] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchSuppliersList();
    loadReport();
  }, []);

  useEffect(() => {
    // Update pagination when filtered imports change
    const total = filteredImports.length;
    setTotalItems(total);
    setTotalPages(Math.max(1, Math.ceil(total / ITEMS_PER_PAGE)));

    // Reset to page 1 if current page is invalid
    if (currentPage > Math.ceil(total / ITEMS_PER_PAGE) && total > 0) {
      setCurrentPage(1);
    }
  }, [filteredImports, currentPage]);

  const fetchSuppliersList = async () => {
    try {
      const data = await fetchSuppliers();
      setSuppliers(Array.isArray(data) ? data : data?.data || []);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    }
  };

  const loadReport = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        supplierId: supplierId || undefined,
      };

      const response = await getImportsReport(params);
      // Handle different response structures
      let importsData = [];
      if (response?.success && response?.data) {
        importsData = Array.isArray(response.data) ? response.data : [];
      } else if (Array.isArray(response?.data)) {
        importsData = response.data;
      } else if (Array.isArray(response)) {
        importsData = response;
      }

      // Sort by date (newest first)
      const sortedImports = importsData.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at),
      );

      setImports(sortedImports);
      setFilteredImports(sortedImports);
    } catch (error) {
      console.error("Error loading imports report:", error);
      setError("មិនអាចទាញយករបាយការណ៍ទិញបានទេ");
      setImports([]);
      setFilteredImports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setExporting(true);
      const params = {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        supplierId: supplierId || undefined,
      };

      const blob = await exportImportReportExcel(params);
      const filename = `import_report_${new Date().toISOString().split("T")[0]}.xlsx`;
      downloadFile(blob, filename);
    } catch (error) {
      console.error("Error exporting Excel:", error);
      setError("មិនអាចបង្កើតឯកសារ Excel បានទេ");
    } finally {
      setExporting(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setExporting(true);
      const params = {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        supplierId: supplierId || undefined,
      };

      const blob = await exportImportReportPDF(params);
      const filename = `import_report_${new Date().toISOString().split("T")[0]}.pdf`;
      downloadFile(blob, filename);
    } catch (error) {
      console.error("Error exporting PDF:", error);
      setError("មិនអាចបង្កើតឯកសារ PDF បានទេ");
    } finally {
      setExporting(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadReport();
  };

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    setSupplierId("");
    setCurrentPage(1);
    setTimeout(() => {
      loadReport();
    }, 100);
  };

  // Pagination functions
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
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

  // Get current page items
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredImports.slice(startIndex, endIndex);
  };

  // Calculate totals and stats from filtered imports
  const stats = React.useMemo(() => {
    const totalAmount = filteredImports.reduce((sum, imp) => {
      const purchaseTotal =
        imp.PurchaseItems && Array.isArray(imp.PurchaseItems)
          ? imp.PurchaseItems.reduce(
              (itemSum, item) =>
                itemSum +
                parseFloat(item.cost_price || 0) * parseFloat(item.qty || 0),
              0,
            )
          : 0;
      return sum + purchaseTotal;
    }, 0);

    const totalPaid = filteredImports.reduce(
      (sum, imp) => sum + parseFloat(imp.paid || 0),
      0,
    );
    const totalBalance = filteredImports.reduce(
      (sum, imp) => sum + parseFloat(imp.balance || 0),
      0,
    );

    const totalQty = filteredImports.reduce((sum, imp) => {
      const qty =
        imp.PurchaseItems && Array.isArray(imp.PurchaseItems)
          ? imp.PurchaseItems.reduce(
              (itemSum, item) => itemSum + parseFloat(item.qty || 0),
              0,
            )
          : 0;
      return sum + qty;
    }, 0);

    const unpaidCount = filteredImports.filter(
      (imp) => parseFloat(imp.balance || 0) > 0,
    ).length;

    const paidCount = filteredImports.filter(
      (imp) => parseFloat(imp.balance || 0) === 0,
    ).length;

    return {
      totalAmount,
      totalPaid,
      totalBalance,
      totalQty,
      unpaidCount,
      paidCount,
      count: filteredImports.length,
    };
  }, [filteredImports]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                របាយការណ៍ទិញ
              </h1>
              <p className="text-gray-600 text-sm">
                វិភាគនិងត្រួតពិនិត្យការទិញទាំងអស់
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">ចំណាយសរុប</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${stats.totalAmount.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.count} ការទិញ
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-purple-600" />
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
                <p className="text-xs text-gray-500 mt-1">
                  {((stats.totalPaid / stats.totalAmount) * 100 || 0).toFixed(
                    1,
                  )}
                  %
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">បំណុល</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${stats.totalBalance.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.unpaidCount} ការទិញ
                </p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">ចំនួនសរុប</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalQty}
                </p>
                <p className="text-xs text-gray-500 mt-1">ទំនិញទិញចូល</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              តម្រងរបាយការណ៍
            </h3>
          </div>

          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  ថ្ងៃចាប់ផ្តើម
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  ថ្ងៃបញ្ចប់
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="inline h-4 w-4 mr-1" />
                  អ្នកផ្គត់ផ្គង់
                </label>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                >
                  <option value="">ទាំងអស់</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-50"
                >
                  <Search className="h-5 w-5" />
                  {loading ? "កំពុងស្វែងរក..." : "ស្វែងរក"}
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Export Buttons */}
            <div className="flex flex-wrap gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={handleExportExcel}
                disabled={exporting || loading || filteredImports.length === 0}
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
              >
                <FileSpreadsheet className="h-5 w-5" />
                {exporting ? "កំពុងបង្កើត..." : "បញ្ចេញ Excel"}
              </button>
              <button
                type="button"
                onClick={handleExportPDF}
                disabled={exporting || loading || filteredImports.length === 0}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
              >
                <FilePlus className="h-5 w-5" />
                {exporting ? "កំពុងបង្កើត..." : "បញ្ចេញ PDF"}
              </button>
            </div>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg text-red-700 flex items-center gap-3">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600 font-medium">
              កំពុងទាញយកទិន្នន័យ...
            </p>
          </div>
        ) : filteredImports.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              គ្មានទិន្នន័យទេ
            </h3>
            <p className="text-gray-600">
              គ្មានទិន្នន័យទិញសម្រាប់តម្រងនេះទេ
            </p>
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
                      អ្នកផ្គត់ផ្គង់
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      សរុប
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      បានបង់
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      បំណុល
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      ស្ថានភាព
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {getCurrentPageItems().map((imp, index) => {
                    const purchaseTotal =
                      imp.PurchaseItems && Array.isArray(imp.PurchaseItems)
                        ? imp.PurchaseItems.reduce(
                            (sum, item) =>
                              sum +
                              parseFloat(item.cost_price || 0) *
                                parseFloat(item.qty || 0),
                            0,
                          )
                        : 0;

                    return (
                      <tr
                        key={imp.id}
                        className={`hover:bg-purple-50 transition-colors ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 text-sm font-bold rounded-lg">
                            #{imp.id}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {new Date(imp.created_at).toLocaleDateString(
                              "km-KH",
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {imp.Supplier?.name?.charAt(0) || "?"}
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {imp.Supplier?.name || "N/A"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="text-base font-bold text-purple-700">
                            ${purchaseTotal.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="text-sm font-semibold text-green-600">
                            ${parseFloat(imp.paid || 0).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span
                            className={`inline-flex items-center px-3 py-1 text-sm font-bold rounded-lg shadow-sm ${
                              parseFloat(imp.balance || 0) > 0
                                ? "bg-gradient-to-r from-red-500 to-pink-500 text-white"
                                : "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                            }`}
                          >
                            ${parseFloat(imp.balance || 0).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold ${
                              parseFloat(imp.balance || 0) > 0
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {parseFloat(imp.balance || 0) > 0
                              ? "បំណុល"
                              : "បានបង់"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between border-t bg-gradient-to-r from-gray-50 to-gray-100 gap-3">
                <div className="text-sm text-gray-700 font-medium">
                  បង្ហាញ{" "}
                  <span className="font-bold text-purple-600">
                    {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                    {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}
                  </span>{" "}
                  នៃ{" "}
                  <span className="font-bold text-purple-600">
                    {totalItems}
                  </span>{" "}
                  ការទិញ
                </div>

                <nav className="flex items-center gap-1 flex-wrap justify-center">
                  <button
                    onClick={() => goToPage(1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-purple-50 hover:border-purple-300 hover:text-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    « ដើម
                  </button>

                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-purple-50 hover:border-purple-300 hover:text-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-600 shadow-lg"
                            : "border-gray-300 bg-white text-gray-700 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-600"
                        }`}
                      >
                        {p}
                      </button>
                    ),
                  )}

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-purple-50 hover:border-purple-300 hover:text-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    បន្ទាប់
                  </button>

                  <button
                    onClick={() => goToPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-purple-50 hover:border-purple-300 hover:text-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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

export default ImportReport;