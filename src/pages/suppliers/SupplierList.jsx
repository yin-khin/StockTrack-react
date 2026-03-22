// src/pages/suppliers/SupplierList.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { fetchSuppliers, deleteSupplier } from "../../api/supplier.api";
import { Link } from "react-router-dom";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  Filter,
  Users,
  Phone,
  MapPin,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  TrendingUp,
  Activity,
  Ambulance,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { can } from "../../utils/permissions";

const ITEMS_PER_PAGE = 10;

const SupplierList = () => {
  const { user } = useAuth();

  const canCreate = can(user, "supplier", "create");
  const canEdit = can(user, "supplier", "edit");
  const canDelete = can(user, "supplier", "delete");

  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSuppliers, setSelectedSuppliers] = useState(new Set());
  const [sortConfig, setSortConfig] = useState({
    key: "id",
    direction: "desc",
  });

  // Status configuration
  const statusConfig = {
    active: {
      label: "សកម្ម",
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: "●",
      dotColor: "bg-emerald-500",
    },
    inactive: {
      label: "អសកម្ម",
      color: "bg-gray-50 text-gray-700 border-gray-200",
      icon: "○",
      dotColor: "bg-gray-400",
    },
    suspended: {
      label: "ផ្អាក",
      color: "bg-amber-50 text-amber-700 border-amber-200",
      icon: "▲",
      dotColor: "bg-amber-500",
    },
    blocked: {
      label: "រាំងខ្ទប់",
      color: "bg-rose-50 text-rose-700 border-rose-200",
      icon: "✕",
      dotColor: "bg-rose-500",
    },
    pending: {
      label: "រង់ចាំ",
      color: "bg-sky-50 text-sky-700 border-sky-200",
      icon: "◐",
      dotColor: "bg-sky-500",
    },
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchSuppliers();
      const sorted = Array.isArray(data)
        ? data.sort((a, b) => b.id - a.id)
        : [];
      setSuppliers(sorted);
    } catch (err) {
      console.error("Error loading suppliers:", err);
      setError("មិនអាចទាញយកបញ្ជីអ្នកផ្គត់ផ្គង់បានទេ។ សូមព្យាយាមម្តងទៀត។");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDelete = async (id) => {
    if (!canDelete) return;
    if (!window.confirm("តើអ្នកប្រាកដថាចង់លុបអ្នកផ្គត់ផ្គង់នេះទេ?")) return;

    try {
      await deleteSupplier(id);
      setSelectedSuppliers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      loadSuppliers();
    } catch (err) {
      console.error("Error deleting:", err);
      alert("មិនអាចលុបអ្នកផ្គត់ផ្គង់បានទេ។");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedSuppliers.size === 0) return;
    if (
      !window.confirm(
        `តើអ្នកប្រាកដជាចង់លុបអ្នកផ្គត់ផ្គង់ ${selectedSuppliers.size} នាក់មែនទេ?`,
      )
    )
      return;

    try {
      await Promise.all(
        Array.from(selectedSuppliers).map((id) => deleteSupplier(id)),
      );
      setSelectedSuppliers(new Set());
      loadSuppliers();
    } catch (err) {
      alert("មិនអាចលុបអ្នកផ្គត់ផ្គង់មួយចំនួនបានទេ។");
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedSuppliers(new Set(paginatedSuppliers.map((s) => s.id)));
    } else {
      setSelectedSuppliers(new Set());
    }
  };

  const handleSelectOne = (id) => {
    setSelectedSuppliers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSearchType("all");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  const handleExport = () => {
    const headers = ["ID", "Name", "Status", "Phone 1", "Phone 2", "Address"];
    const rows = filteredSuppliers.map((s) => [
      s.id,
      s.name || "",
      s.status || "active",
      s.phone_first || "",
      s.phone_second || "",
      s.address || "",
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `suppliers_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  // Filtering & Sorting
  const filteredSuppliers = useMemo(() => {
    let result = [...suppliers];

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((s) => (s.status || "active") === statusFilter);
    }

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter((s) => {
        const id = s?.id?.toString() ?? "";
        const name = (s?.name ?? "").toLowerCase();
        const phone1 = (s?.phone_first ?? "").toLowerCase();
        const phone2 = (s?.phone_second ?? "").toLowerCase();
        const address = (s?.address ?? "").toLowerCase();

        switch (searchType) {
          case "id":
            return id.includes(term);
          case "name":
            return name.includes(term);
          case "phone":
            return phone1.includes(term) || phone2.includes(term);
          case "address":
            return address.includes(term);
          default:
            return (
              id.includes(term) ||
              name.includes(term) ||
              phone1.includes(term) ||
              phone2.includes(term) ||
              address.includes(term)
            );
        }
      });
    }

    // Sort
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key] || "";
        const bVal = b[sortConfig.key] || "";

        if (typeof aVal === "string") {
          return sortConfig.direction === "asc"
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }

        return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
      });
    }

    return result;
  }, [suppliers, searchTerm, searchType, statusFilter, sortConfig]);

  const totalItems = filteredSuppliers.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const paginatedSuppliers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredSuppliers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredSuppliers, currentPage]);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setSelectedSuppliers(new Set());
    }
  };

  // Stats
  const stats = useMemo(() => {
    const counts = { all: suppliers.length };
    suppliers.forEach((s) => {
      const status = s.status || "active";
      counts[status] = (counts[status] || 0) + 1;
    });
    return counts;
  }, [suppliers]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 text-lg font-medium">
            កំពុងទាញយកទិន្នន័យ...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50">
      <div className="p-4 md:p-8 space-y-6 max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                <Users className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                  អ្នកផ្គត់ផ្គង់
                </h1>
                <p className="text-sm text-gray-500">
                  Inventory Management / Suppliers
                </p>
              </div>
            </div>
            <p className="text-gray-600 text-lg">
              គ្រប់គ្រងបញ្ជីអ្នកផ្គត់ផ្គង់ និងស្វែងរកបានលឿន
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {totalItems > 0 && (
              <button
                onClick={handleExport}
                className="bg-white hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-xl border-2 border-gray-200 flex items-center gap-2 transition-all"
              >
                <Download size={18} />
                <span className="font-medium">នាំចេញ</span>
              </button>
            )}

            {canCreate && (
              <Link
                to="/suppliers/new"
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
              >
                <Plus size={20} />
                <span className="font-semibold">បន្ថែមអ្នកផ្គត់ផ្គង់</span>
              </Link>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">សរុប</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.all?.toLocaleString("km-KH") || "០"}
                </p>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                <Users className="text-blue-600" size={28} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-emerald-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-600">សកម្ម</p>
                <p className="text-3xl font-bold text-emerald-700 mt-1">
                  {stats.active?.toLocaleString("km-KH") || "០"}
                </p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-xl border-2 border-emerald-200">
                <Activity className="text-emerald-600" size={28} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-amber-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600">ផ្អាក</p>
                <p className="text-3xl font-bold text-amber-700 mt-1">
                  {stats.suspended?.toLocaleString("km-KH") || "០"}
                </p>
              </div>
              <div className="p-4 bg-amber-50 rounded-xl border-2 border-amber-200">
                <TrendingUp className="text-amber-600" size={28} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-sky-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-sky-600">រង់ចាំ</p>
                <p className="text-3xl font-bold text-sky-700 mt-1">
                  {stats.pending?.toLocaleString("km-KH") || "០"}
                </p>
              </div>
              <div className="p-4 bg-sky-50 rounded-xl border-2 border-sky-200">
                <Phone className="text-sky-600" size={28} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ផ្សេងទៀត</p>
                <p className="text-3xl font-bold text-gray-700 mt-1">
                  {(
                    (stats.inactive || 0) + (stats.blocked || 0)
                  ).toLocaleString("km-KH")}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
                <MapPin className="text-gray-600" size={28} />
              </div>
            </div>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={20} className="text-gray-600" />
            <h3 className="text-base font-bold text-gray-800">
              ត្រងតាមស្ថានភាព
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                statusFilter === "all"
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
              }`}
            >
              ទាំងអស់ ({stats.all || 0})
            </button>
            {Object.entries(statusConfig).map(([status, config]) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                  statusFilter === status
                    ? `${config.color} border-current`
                    : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                }`}
              >
                <span className="mr-2">{config.icon}</span>
                {config.label} ({stats[status] || 0})
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-5">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Type */}
            <div className="lg:w-56">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ប្រភេទស្វែងរក
              </label>
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-800 outline-none focus:border-blue-500 transition"
              >
                <option value="all">ស្វែងរកទាំងអស់</option>
                <option value="id">ស្វែងរកតាម ID</option>
                <option value="name">ស្វែងរកតាមឈ្មោះ</option>
                <option value="phone">ស្វែងរកតាមទូរស័ព្ទ</option>
                <option value="address">ស្វែងរកតាមអាសយដ្ឋាន</option>
              </select>
            </div>

            {/* Search Input */}
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ពាក្យគន្លឹះ
              </label>
              <div className="relative">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  className="w-full rounded-xl border-2 border-gray-200 bg-white py-3 pl-12 pr-12 text-sm font-medium text-gray-800 outline-none focus:border-blue-500 transition"
                  placeholder={
                    searchType === "id"
                      ? "ស្វែងរកតាម ID..."
                      : searchType === "name"
                        ? "ស្វែងរកតាមឈ្មោះ..."
                        : searchType === "phone"
                          ? "ស្វែងរកតាមទូរស័ព្ទ..."
                          : searchType === "address"
                            ? "ស្វែងរកតាមអាសយដ្ឋាន..."
                            : "ស្វែងរកទាំងអស់..."
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Results info */}
              {(searchTerm || statusFilter !== "all") && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-sm text-gray-600">
                    រកឃើញ{" "}
                    <span className="font-bold text-blue-600">
                      {filteredSuppliers.length.toLocaleString("km-KH")}
                    </span>{" "}
                    លទ្ធផល
                  </span>
                  {searchTerm && (
                    <span className="px-3 py-1 rounded-full bg-gray-100 border border-gray-200 text-xs font-semibold text-gray-700">
                      {searchType === "all"
                        ? "ទាំងអស់"
                        : searchType === "id"
                          ? "ID"
                          : searchType === "name"
                            ? "ឈ្មោះ"
                            : searchType === "phone"
                              ? "ទូរស័ព្ទ"
                              : "អាសយដ្ឋាន"}
                    </span>
                  )}
                  {statusFilter !== "all" && (
                    <span
                      className={`px-3 py-1 rounded-full border text-xs font-semibold ${statusConfig[statusFilter]?.color}`}
                    >
                      {statusConfig[statusFilter]?.label}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 lg:pt-8">
              {(searchTerm || statusFilter !== "all") && (
                <button
                  onClick={clearFilters}
                  className="flex-1 lg:flex-none px-5 py-3 rounded-xl border-2 border-gray-200 bg-white text-gray-700 font-semibold hover:border-gray-300 transition-all flex items-center justify-center gap-2"
                >
                  <X size={18} />
                  សម្អាត
                </button>
              )}

              {selectedSuppliers.size > 0 && canDelete && (
                <button
                  onClick={handleBulkDelete}
                  className="flex-1 lg:flex-none px-5 py-3 rounded-xl border-2 border-rose-200 bg-rose-50 text-rose-700 font-semibold hover:bg-rose-100 transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 size={18} />
                  លុប ({selectedSuppliers.size})
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-rose-50 border-2 border-rose-200 text-rose-700 p-5 rounded-xl">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
          {filteredSuppliers.length === 0 ? (
            <div className="text-center p-16">
              <div className="inline-block p-6 bg-gray-50 rounded-full border-2 border-gray-200 mb-6">
                <Users className="h-20 w-20 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {searchTerm || statusFilter !== "all"
                  ? "គ្មានលទ្ធផលស្វែងរក"
                  : "គ្មានអ្នកផ្គត់ផ្គង់ទេ"}
              </h3>
              <p className="text-gray-600 text-lg max-w-md mx-auto mb-6">
                {searchTerm || statusFilter !== "all"
                  ? "សូមព្យាយាមស្វែងរកជាមួយពាក្យគន្លឹះផ្សេង ឬផ្លាស់ប្តូរតម្រង"
                  : canCreate
                    ? "ចាប់ផ្តើមដោយបន្ថែមអ្នកផ្គត់ផ្គង់ដំបូងរបស់អ្នក"
                    : "មិនមានអ្នកផ្គត់ផ្គង់សម្រាប់អ្នកប្រើប្រាស់នេះទេ"}
              </p>
              {(searchTerm || statusFilter !== "all") && (
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:from-blue-700 hover:to-blue-800 transition-all"
                >
                  សម្អាតការស្វែងរក
                </button>
              )}
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
                              selectedSuppliers.size ===
                                paginatedSuppliers.length &&
                              paginatedSuppliers.length > 0
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
                          ID
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
                        ស្ថានភាព
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        ទូរស័ព្ទទី១
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        ទូរស័ព្ទទី២
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        អាសយដ្ឋាន
                      </th>
                      {(canEdit || canDelete) && (
                        <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                          សកម្មភាព
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {paginatedSuppliers.map((supplier) => {
                      const status = supplier.status || "active";
                      const statusInfo =
                        statusConfig[status] || statusConfig.active;

                      return (
                        <tr
                          key={supplier.id}
                          className={`hover:bg-blue-50/50 transition-all ${
                            selectedSuppliers.has(supplier.id)
                              ? "bg-blue-50"
                              : ""
                          }`}
                        >
                          {canDelete && (
                            <td className="px-6 py-4">
                              <input
                                type="checkbox"
                                checked={selectedSuppliers.has(supplier.id)}
                                onChange={() => handleSelectOne(supplier.id)}
                                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                              />
                            </td>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-bold text-gray-900">
                              #{supplier.id}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center border-2 border-purple-200">
                                <span className="text-white font-bold text-lg">
                                  {/* {supplier.name
                                    ? supplier.name.charAt(0).toUpperCase()
                                    : "?"} */}
                                    <Ambulance/>
                                </span>
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-gray-900">
                                  {supplier.name || "—"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border-2 ${statusInfo.color}`}
                            >
                              <span
                                className={`w-2 h-2 rounded-full ${statusInfo.dotColor}`}
                              ></span>
                              {statusInfo.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {supplier.phone_first ? (
                              <div className="flex items-center gap-2">
                                <Phone size={16} className="text-emerald-600" />
                                <span className="text-sm font-medium text-gray-700">
                                  {supplier.phone_first}
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {supplier.phone_second ? (
                              <div className="flex items-center gap-2">
                                <Phone size={16} className="text-sky-600" />
                                <span className="text-sm font-medium text-gray-700">
                                  {supplier.phone_second}
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {supplier.address ? (
                              <div className="flex items-start gap-2 max-w-xs">
                                <MapPin
                                  size={16}
                                  className="text-purple-600 flex-shrink-0 mt-0.5"
                                />
                                <span className="text-sm text-gray-700 line-clamp-2">
                                  {supplier.address}
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          {(canEdit || canDelete) && (
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="flex justify-center gap-2">
                                {canEdit && (
                                  <Link
                                    to={`/suppliers/edit/${supplier.id}`}
                                    className="p-2.5 rounded-lg bg-blue-100 border-2 border-blue-200 text-blue-700 hover:bg-blue-200 transition-all"
                                    title="កែសម្រួល"
                                  >
                                    <Edit size={16} />
                                  </Link>
                                )}
                                {canDelete && (
                                  <button
                                    onClick={() => handleDelete(supplier.id)}
                                    className="p-2.5 rounded-lg bg-rose-100 border-2 border-rose-200 text-rose-700 hover:bg-rose-200 transition-all"
                                    title="លុប"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-5 flex flex-col sm:flex-row items-center justify-between border-t-2 border-gray-200 bg-gray-50 gap-4">
                  <div className="text-sm text-gray-700 font-medium">
                    បង្ហាញ{" "}
                    <span className="text-purple-600 font-bold">
                      {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                      {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}
                    </span>{" "}
                    នៃ{" "}
                    <span className="text-purple-600 font-bold">
                      {totalItems.toLocaleString("km-KH")}
                    </span>{" "}
                    អ្នកផ្គត់ផ្គង់
                  </div>

                  <nav className="flex items-center gap-1.5">
                    <button
                      onClick={() => goToPage(1)}
                      disabled={currentPage === 1}
                      className="p-2 border-2 border-gray-200 rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      title="ទំព័រដំបូង"
                    >
                      <ChevronsLeft size={18} />
                    </button>

                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 border-2 border-gray-200 rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
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
                            className={`min-w-[40px] px-4 py-2 border-2 rounded-lg text-sm font-bold transition-all ${
                              currentPage === i
                                ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white border-purple-600"
                                : "border-gray-200 hover:bg-gray-50 text-gray-700 bg-white"
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
                      className="p-2 border-2 border-gray-200 rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      title="បន្ទាប់"
                    >
                      <ChevronRight size={18} />
                    </button>

                    <button
                      onClick={() => goToPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="p-2 border-2 border-gray-200 rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
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
      </div>
    </div>
  );
};

export default SupplierList;
