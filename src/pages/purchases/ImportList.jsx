// src/pages/purchases/ImportList.jsx
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { fetchPurchases, deletePurchase } from "../../api/purchase.api";
import { useAuth } from "../../context/AuthContext";
import { AdminOnly, can } from "../../utils/permissions";
import {
  ShoppingBag,
  Search,
  X,
  Plus,
  Edit,
  Trash2,
  Package,
  DollarSign,
  TrendingDown,
  AlertCircle,
  Truck,
  Calendar,
} from "lucide-react";

const ITEMS_PER_PAGE = 10;

const ImportList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("all");
  const [deleting, setDeleting] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);

  // Permission checks
  const canCreate = can(user, "purchase", "create");
  const canEdit = can(user, "purchase", "edit");
  const canDelete = can(user, "purchase", "delete");

  useEffect(() => {
    loadPurchases();
  }, []);

  const loadPurchases = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchPurchases();
      const purchasesData =
        response?.purchase || response?.data || response || [];
      const sortedPurchases = Array.isArray(purchasesData)
        ? purchasesData.sort((a, b) => b.id - a.id)
        : [];
      setPurchases(sortedPurchases);
    } catch (error) {
      console.error("Error loading purchases:", error);
      setError("មិនអាចទាញយកបញ្ជីទិញបានទេ");
      setPurchases([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate total quantity from purchase items
  const getTotalQuantity = (purchase) => {
    if (!purchase.PurchaseItems || !Array.isArray(purchase.PurchaseItems))
      return 0;
    return purchase.PurchaseItems.reduce(
      (sum, item) => sum + (item.qty || 0),
      0,
    );
  };

  const handleDelete = async (id) => {
    if (!window.confirm("តើអ្នកពិតជាចង់លុបការទិញនេះមែនទេ?")) {
      return;
    }

    try {
      setDeleting(id);
      await deletePurchase(id);
      loadPurchases();
    } catch (error) {
      console.error("Error deleting purchase:", error);
      setError("មិនអាចលុបការទិញបានទេ");
    } finally {
      setDeleting(null);
    }
  };

  const handleEdit = (id) => {
    navigate(`/purchases/edit/${id}`);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setSearchType("all");
    setCurrentPage(1);
  };

  // Filter purchases
  const filteredPurchases = useMemo(() => {
    if (!searchTerm.trim()) return purchases;

    const term = searchTerm.toLowerCase();
    return purchases.filter((purchase) => {
      switch (searchType) {
        case "supplier":
          return purchase.Supplier?.name?.toLowerCase().includes(term);
        case "date":
          const dateStr = purchase.created_at
            ? new Date(purchase.created_at).toLocaleDateString("en-US")
            : "";
          return dateStr.toLowerCase().includes(term);
        case "id":
          return purchase.id.toString().includes(term);
        case "all":
        default:
          return (
            purchase.id.toString().includes(term) ||
            purchase.Supplier?.name?.toLowerCase().includes(term) ||
            purchase.total?.toString().includes(term) ||
            purchase.paid?.toString().includes(term) ||
            purchase.balance?.toString().includes(term)
          );
      }
    });
  }, [purchases, searchTerm, searchType]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalAmount = purchases.reduce(
      (sum, p) => sum + parseFloat(p.total || 0),
      0,
    );
    const totalPaid = purchases.reduce(
      (sum, p) => sum + parseFloat(p.paid || 0),
      0,
    );
    const totalBalance = purchases.reduce(
      (sum, p) => sum + parseFloat(p.balance || 0),
      0,
    );
    const totalQty = purchases.reduce((sum, p) => sum + getTotalQuantity(p), 0);

    return {
      totalAmount,
      totalPaid,
      totalBalance,
      totalQty,
      count: purchases.length,
    };
  }, [purchases]);

  // Pagination
  const totalItems = filteredPurchases.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
    if (currentPage < 1) setCurrentPage(1);
  }, [currentPage, totalPages]);

  const paginatedPurchases = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPurchases.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredPurchases, currentPage]);

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
            <div className="h-12 w-12 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
              <ShoppingBag className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">បញ្ជីទិញចូល</h1>
              <p className="text-gray-600 text-sm">គ្រប់គ្រងការទិញទាំងអស់</p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-orange-500">
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
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-orange-600" />
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
                <TrendingDown className="h-6 w-6 text-green-600" />
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
                  {(
                    (stats.totalBalance / stats.totalAmount) * 100 || 0
                  ).toFixed(1)}
                  %
                </p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600" />
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
                <p className="text-xs text-gray-500 mt-1">ទំនិញទិញចូល</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search & Actions */}
        <div className="bg-white rounded-xl shadow-md p-5 mb-6">
          <div className="flex flex-col gap-4">
            {/* Search Controls */}
            <div className="flex flex-col lg:flex-row gap-3">
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="lg:w-48 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
              >
                <option value="all">ស្វែងរកទាំងអស់</option>
                <option value="id">ស្វែងរកតាម ID</option>
                <option value="supplier">ស្វែងរកតាមអ្នកផ្គត់ផ្គង់</option>
                <option value="date">ស្វែងរកតាមថ្ងៃខែ</option>
              </select>

              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder={
                    searchType === "all"
                      ? "ស្វែងរក ID, អ្នកផ្គត់ផ្គង់, សរុប..."
                      : searchType === "supplier"
                        ? "ស្វែងរកឈ្មោះអ្នកផ្គត់ផ្គង់..."
                        : searchType === "date"
                          ? "ស្វែងរកថ្ងៃខែ..."
                          : "ស្វែងរក ID..."
                  }
                  className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                />
                {searchTerm && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>

              {canCreate && (
                <button
                  onClick={() => navigate("/purchases/new")}
                  className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Plus className="h-5 w-5" />
                  បន្ថែមការទិញថ្មី
                </button>
              )}
            </div>

            {/* Search Results Info */}
            {searchTerm && (
              <div className="text-sm text-gray-600">
                រកឃើញ{" "}
                <span className="font-semibold text-orange-600">
                  {filteredPurchases.length}
                </span>{" "}
                លទ្ធផល
                {searchType !== "all" && (
                  <span>
                    {" "}
                    សម្រាប់{" "}
                    <span className="font-semibold">
                      {searchType === "supplier"
                        ? "អ្នកផ្គត់ផ្គង់"
                        : searchType === "date"
                          ? "ថ្ងៃខែ"
                          : "ID"}
                    </span>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg text-red-700 flex items-center gap-3">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600 font-medium">
              កំពុងទាញយកទិន្នន័យ...
            </p>
          </div>
        ) : totalItems === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm ? "គ្មានលទ្ធផលស្វែងរក" : "គ្មានការទិញទេ"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? "សូមព្យាយាមស្វែងរកជាមួយពាក្យគន្លឹះផ្សេង"
                : canCreate
                  ? "ចាប់ផ្តើមដោយបង្កើតការទិញថ្មី"
                  : "មិនមានការទិញសម្រាប់អ្នកប្រើប្រាស់នេះទេ"}
            </p>
            {searchTerm ? (
              <button
                onClick={handleClearSearch}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-xl font-medium shadow-lg transition-all"
              >
                សម្អាតការស្វែងរក
              </button>
            ) : canCreate ? (
              <button
                onClick={() => navigate("/purchases/new")}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-xl font-medium shadow-lg transition-all"
              >
                <Plus className="h-5 w-5 mr-2" />
                បង្កើតការទិញថ្មី
              </button>
            ) : null}
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
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      ចំនួន
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
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      សកម្មភាព
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-100">
                  {paginatedPurchases.map((purchase, index) => (
                    <tr
                      key={purchase.id}
                      className={`hover:bg-orange-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-800 text-sm font-bold rounded-lg">
                          #{purchase.id}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {purchase.created_at
                            ? new Date(purchase.created_at).toLocaleDateString(
                                "km-KH",
                              )
                            : "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {purchase.Supplier?.name?.charAt(0) || "?"}
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {purchase.Supplier?.name || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 text-sm font-bold rounded-lg">
                          <Package className="h-4 w-4" />
                          {getTotalQuantity(purchase)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-base font-bold text-orange-700">
                          ${parseFloat(purchase.total || 0).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-sm font-semibold text-green-600">
                          ${parseFloat(purchase.paid || 0).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span
                          className={`inline-flex items-center px-3 py-1 text-sm font-bold rounded-lg shadow-sm ${
                            parseFloat(purchase.balance || 0) > 0
                              ? "bg-gradient-to-r from-red-500 to-pink-500 text-white"
                              : "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                          }`}
                        >
                          ${parseFloat(purchase.balance || 0).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold ${
                            parseFloat(purchase.balance || 0) > 0
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {parseFloat(purchase.balance || 0) > 0
                            ? "បំណុល"
                            : "បានបង់"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <AdminOnly>
                          <div className="flex items-center justify-end gap-2">
                            {canEdit && (
                              <button
                                onClick={() => handleEdit(purchase.id)}
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all transform hover:scale-110"
                                title="កែសម្រួល"
                              >
                                <Edit className="h-5 w-5" />
                              </button>
                            )}
                            {canDelete && (
                              <button
                                onClick={() => handleDelete(purchase.id)}
                                disabled={deleting === purchase.id}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all transform hover:scale-110 disabled:opacity-50"
                                title="លុប"
                              >
                                {deleting === purchase.id ? (
                                  <div className="h-5 w-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <Trash2 className="h-5 w-5" />
                                )}
                              </button>
                            )}
                            {!canEdit && !canDelete && (
                              <span className="text-gray-400 text-sm">
                                មិនមានសកម្មភាព
                              </span>
                            )}
                          </div>
                        </AdminOnly>
                      </td>
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
                  <span className="font-bold text-orange-600">
                    {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                    {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}
                  </span>{" "}
                  នៃ{" "}
                  <span className="font-bold text-orange-600">
                    {totalItems}
                  </span>{" "}
                  ការទិញ
                </div>

                <nav className="flex items-center gap-1 flex-wrap justify-center">
                  <button
                    onClick={() => goToPage(1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    « ដើម
                  </button>

                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
                            ? "bg-gradient-to-r from-orange-600 to-red-600 text-white border-orange-600 shadow-lg"
                            : "border-gray-300 bg-white text-gray-700 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600"
                        }`}
                      >
                        {p}
                      </button>
                    ),
                  )}

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    បន្ទាប់
                  </button>

                  <button
                    onClick={() => goToPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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

export default ImportList;
