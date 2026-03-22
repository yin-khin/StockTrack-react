// src/pages/customers/CustomerList.jsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { fetchCustomers, deleteCustomer } from "../../api/customer.api";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  User,
  Phone,
  MapPin,
  Calendar,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  UserRoundCheck,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { can } from "../../utils/permissions";
import CustomerForm from "./CustomerForm";
import debounce from "lodash/debounce";

const ITEMS_PER_PAGE = 10;

const CustomerList = () => {
  const { user } = useAuth();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState(null);
  const [selectedCustomers, setSelectedCustomers] = useState(new Set());
  const [sortConfig, setSortConfig] = useState({
    key: "created_at",
    direction: "desc",
  });

  // Permissions
  const canCreate = can(user, "customer", "create");
  const canEdit = can(user, "customer", "edit");
  const canDelete = can(user, "customer", "delete");

  // Debounce search
  const debouncedSetSearch = useMemo(
    () =>
      debounce((value) => {
        setDebouncedSearch(value.trim());
        setCurrentPage(1);
      }, 400),
    [],
  );

  useEffect(() => {
    debouncedSetSearch(searchTerm);
    return () => debouncedSetSearch.cancel();
  }, [searchTerm, debouncedSetSearch]);

  // Fetch customers
  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchCustomers();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching customers:", err);
      setError("មិនអាចទាញយកបញ្ជីអតិថិជនបានទេ។ សូមព្យាយាមម្តងទៀត។");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  // Handlers
  const handleDelete = async (id) => {
    if (!window.confirm("តើអ្នកប្រាកដជាចង់លុបអតិថិជននេះមែនទេ?")) return;

    try {
      await deleteCustomer(id);
      setSelectedCustomers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      loadCustomers();
    } catch (err) {
      console.error("Error deleting customer:", err);
      alert("មិនអាចលុបអតិថិជនបានទេ។ សូមព្យាយាមម្តងទៀត។");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCustomers.size === 0) return;

    if (
      !window.confirm(
        `តើអ្នកប្រាកដជាចង់លុបអតិថិជន ${selectedCustomers.size} នាក់មែនទេ?`,
      )
    )
      return;

    try {
      await Promise.all(
        Array.from(selectedCustomers).map((id) => deleteCustomer(id)),
      );
      setSelectedCustomers(new Set());
      loadCustomers();
    } catch (err) {
      console.error("Error bulk deleting:", err);
      alert("មិនអាចលុបអតិថិជនមួយចំនួនបានទេ។");
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedCustomers(new Set(paginatedCustomers.map((c) => c.id)));
    } else {
      setSelectedCustomers(new Set());
    }
  };

  const handleSelectOne = (id) => {
    setSelectedCustomers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleExport = () => {
    // Export to CSV
    const headers = ["ID", "Name", "Phone", "Address", "Created"];
    const rows = filteredCustomers.map((c) => [
      c.id,
      c.name || "",
      c.phone || "",
      c.address || "",
      c.created_at ? new Date(c.created_at).toLocaleDateString() : "",
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `customers_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  // Filtering & Sorting & Pagination
  const filteredCustomers = useMemo(() => {
    let result = [...customers];

    // Search filter
    if (debouncedSearch) {
      const term = debouncedSearch.toLowerCase();
      result = result.filter((c) =>
        `${c.name || ""} ${c.phone || ""} ${c.address || ""}`
          .toLowerCase()
          .includes(term),
      );
    }

    // Sort
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key] || "";
        const bVal = b[sortConfig.key] || "";

        if (sortConfig.key === "created_at") {
          return sortConfig.direction === "asc"
            ? new Date(aVal) - new Date(bVal)
            : new Date(bVal) - new Date(aVal);
        }

        if (typeof aVal === "string") {
          return sortConfig.direction === "asc"
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }

        return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
      });
    }

    return result;
  }, [customers, debouncedSearch, sortConfig]);

  const totalItems = filteredCustomers.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCustomers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredCustomers, currentPage]);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setSelectedCustomers(new Set()); // Clear selection when changing page
    }
  };

  // Stats
  const stats = useMemo(
    () => ({
      total: customers.length,
      withPhone: customers.filter((c) => c.phone).length,
      withAddress: customers.filter((c) => c.address).length,
    }),
    [customers],
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50">
      <div className="p-4 md:p-8 space-y-6 max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
                <User className="text-white" size={26} />
              </div>
              បញ្ជីអតិថិជន
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              គ្រប់គ្រង និងតាមដានអតិថិជនទាំងអស់
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {totalItems > 0 && (
              <button
                onClick={handleExport}
                className="bg-white hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-md border border-gray-200 transition-all hover:shadow-lg"
              >
                <Download size={18} />
                <span className="font-medium">នាំចេញ</span>
              </button>
            )}

            {canCreate && (
              <button
                onClick={() => {
                  setEditingCustomerId(null);
                  setShowForm(true);
                }}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-lg transition-all hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Plus size={20} />
                <span className="font-semibold">បន្ថែមអតិថិជនថ្មី</span>
              </button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">សរុប</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.total.toLocaleString("km-KH")}
                </p>
              </div>
              <div className="p-4 bg-blue-100 rounded-xl">
                <User className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  មានលេខទូរស័ព្ទ
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.withPhone.toLocaleString("km-KH")}
                </p>
              </div>
              <div className="p-4 bg-green-100 rounded-xl">
                <Phone className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  មានអាសយដ្ឋាន
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.withAddress.toLocaleString("km-KH")}
                </p>
              </div>
              <div className="p-4 bg-purple-100 rounded-xl">
                <MapPin className="text-purple-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ស្វែងរកតាមឈ្មោះ លេខទូរស័ព្ទ ឬអាសយដ្ឋាន..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-base"
              />
            </div>

            {selectedCustomers.size > 0 && canDelete && (
              <button
                onClick={handleBulkDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl flex items-center gap-2 shadow-md transition-all whitespace-nowrap"
              >
                <Trash2 size={18} />
                លុប ({selectedCustomers.size})
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-5 rounded-xl shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Trash2 size={20} className="text-red-600" />
              </div>
              <p className="font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-md p-16 text-center border border-gray-100">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-6 text-gray-600 text-lg font-medium">
              កំពុងទាញយកទិន្នន័យ...
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
            {paginatedCustomers.length === 0 ? (
              <div className="p-16 text-center">
                <div className="inline-block p-6 bg-gray-100 rounded-full mb-6">
                  <User className="h-20 w-20 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {debouncedSearch ? "មិនមានលទ្ធផល" : "មិនទាន់មានអតិថិជន"}
                </h3>
                <p className="text-gray-600 text-lg max-w-md mx-auto">
                  {debouncedSearch
                    ? `គ្មានអតិថិជនណាមួយដែលត្រូវនឹង "${debouncedSearch}"`
                    : canCreate
                      ? "ចុចប៊ូតុងខាងលើដើម្បីបន្ថែមអតិថិជនដំបូងរបស់អ្នក"
                      : "សូមទាក់ទងអ្នកគ្រប់គ្រងប្រសិនបើអ្នកត្រូវការបន្ថែមអតិថិជន"}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        {canDelete && (
                          <th className="px-6 py-4 w-12">
                            <input
                              type="checkbox"
                              checked={
                                selectedCustomers.size ===
                                  paginatedCustomers.length &&
                                paginatedCustomers.length > 0
                              }
                              onChange={handleSelectAll}
                              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                            />
                          </th>
                        )}
                        <th
                          className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition"
                          onClick={() => handleSort("id")}
                        >
                          <div className="flex items-center gap-2">
                            លេខសម្គាល់
                            {sortConfig.key === "id" && (
                              <span>
                                {sortConfig.direction === "asc" ? "↑" : "↓"}
                              </span>
                            )}
                          </div>
                        </th>
                        <th
                          className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition"
                          onClick={() => handleSort("name")}
                        >
                          <div className="flex items-center gap-2">
                            ឈ្មោះ
                            {sortConfig.key === "name" && (
                              <span>
                                {sortConfig.direction === "asc" ? "↑" : "↓"}
                              </span>
                            )}
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          លេខទូរស័ព្ទ
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          អាសយដ្ឋាន
                        </th>
                        <th
                          className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition"
                          onClick={() => handleSort("created_at")}
                        >
                          <div className="flex items-center gap-2">
                            បង្កើត
                            {sortConfig.key === "created_at" && (
                              <span>
                                {sortConfig.direction === "asc" ? "↑" : "↓"}
                              </span>
                            )}
                          </div>
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                          សកម្មភាព
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {paginatedCustomers.map((customer, idx) => (
                        <tr
                          key={customer.id}
                          className={`hover:bg-blue-50/50 transition-all ${
                            selectedCustomers.has(customer.id)
                              ? "bg-blue-50"
                              : ""
                          }`}
                        >
                          {canDelete && (
                            <td className="px-6 py-4">
                              <input
                                type="checkbox"
                                checked={selectedCustomers.has(customer.id)}
                                onChange={() => handleSelectOne(customer.id)}
                                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                              />
                            </td>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-semibold text-gray-700">
                              #{customer.id}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl  flex items-center justify-center  flex-shrink-0">
                                <UserRoundCheck className="text-red-400"/>
                                {/* <span className="text-white font-bold text-lg">
                                  {customer.name
                                    ? customer.name.charAt(0).toUpperCase()
                                    : "?"}
                                </span> */}
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-gray-900">
                                  {customer.name || "—"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {customer.phone ? (
                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                <Phone size={16} className="text-green-600" />
                                <span className="font-medium">
                                  {customer.phone}
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {customer.address ? (
                              <div className="flex items-start gap-2 text-sm text-gray-700 max-w-xs">
                                <MapPin
                                  size={16}
                                  className="text-purple-600 flex-shrink-0 mt-0.5"
                                />
                                <span className="line-clamp-2">
                                  {customer.address}
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {customer.created_at ? (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar size={16} className="text-gray-400" />
                                {new Date(
                                  customer.created_at,
                                ).toLocaleDateString("km-KH", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </div>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-2">
                              {canEdit && (
                                <button
                                  onClick={() => {
                                    setEditingCustomerId(customer.id);
                                    setShowForm(true);
                                  }}
                                  className="text-blue-700 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow"
                                >
                                  <Edit size={16} className="inline mr-1.5" />
                                  កែសម្រួល
                                </button>
                              )}
                              {canDelete && (
                                <button
                                  onClick={() => handleDelete(customer.id)}
                                  className="text-red-700 hover:text-red-900 bg-red-100 hover:bg-red-200 px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow"
                                >
                                  <Trash2 size={16} className="inline mr-1.5" />
                                  លុប
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="px-6 py-5 flex flex-col sm:flex-row items-center justify-between border-t bg-gray-50 gap-4">
                    <div className="text-sm text-gray-700 font-medium">
                      បង្ហាញ{" "}
                      <span className="text-blue-600 font-bold">
                        {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                        {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}
                      </span>{" "}
                      នៃ{" "}
                      <span className="text-blue-600 font-bold">
                        {totalItems.toLocaleString("km-KH")}
                      </span>{" "}
                      អតិថិជន
                    </div>

                    <nav className="flex items-center gap-1.5">
                      <button
                        onClick={() => goToPage(1)}
                        disabled={currentPage === 1}
                        className="p-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow"
                        title="ទំព័រដំបូង"
                      >
                        <ChevronsLeft size={18} />
                      </button>

                      <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow"
                        title="មុន"
                      >
                        <ChevronLeft size={18} />
                      </button>

                      {(() => {
                        const pages = [];
                        const range = 2;
                        let start = Math.max(1, currentPage - range);
                        let end = Math.min(totalPages, currentPage + range);

                        for (let i = start; i <= end; i++) {
                          pages.push(
                            <button
                              key={i}
                              onClick={() => goToPage(i)}
                              className={`min-w-[40px] px-4 py-2 border rounded-lg text-sm font-bold transition-all shadow-sm hover:shadow ${
                                currentPage === i
                                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-600 shadow-md"
                                  : "border-gray-300 hover:bg-gray-50 text-gray-700"
                              }`}
                            >
                              {i.toLocaleString("km-KH")}
                            </button>,
                          );
                        }

                        return pages;
                      })()}

                      <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow"
                        title="បន្ទាប់"
                      >
                        <ChevronRight size={18} />
                      </button>

                      <button
                        onClick={() => goToPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="p-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow"
                        title="ទំព័រចុងក្រោយ"
                      >
                        <ChevronsRight size={18} />
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Modal Form */}
        <CustomerForm
          isOpen={showForm}
          onClose={() => {
            setShowForm(false);
            setEditingCustomerId(null);
          }}
          onSuccess={() => {
            setShowForm(false);
            setEditingCustomerId(null);
            loadCustomers();
          }}
          customerId={editingCustomerId}
        />
      </div>
    </div>
  );
};

export default CustomerList;
