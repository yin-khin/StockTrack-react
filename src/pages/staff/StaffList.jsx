// src/pages/staff/StaffList.jsx
import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  User,
  Phone,
  Calendar,
  Users,
  Grid3x3,
  List,
  Mail,
  MapPin,
  Briefcase,
  Eye,
  X,
  RefreshCw,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  fetchAllStaff,
  deleteStaff,
  toggleStaffStatus,
} from "../../api/staff.api";
import StaffForm from "./StaffForm";
import { SuperAdminOnly } from "../../utils/permissions";

const ITEMS_PER_PAGE = 10;

const StaffList = () => {
  const [staff, setStaff] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'grid'
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailStaff, setDetailStaff] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    loadStaff();
  }, []);

  useEffect(() => {
    filterStaff();
  }, [searchTerm, staff, statusFilter]);

  useEffect(() => {
    const total = filteredStaff.length;
    setTotalItems(total);
    setTotalPages(Math.ceil(total / ITEMS_PER_PAGE));

    if (currentPage > Math.ceil(total / ITEMS_PER_PAGE)) {
      setCurrentPage(1);
    }
  }, [filteredStaff, currentPage]);

  const loadStaff = async () => {
    try {
      setLoading(true);
      const response = await fetchAllStaff();

      if (response.success && response.data) {
        setStaff(response.data);
      } else if (Array.isArray(response)) {
        setStaff(response);
      } else if (response.data && Array.isArray(response.data)) {
        setStaff(response.data);
      } else {
        setStaff([]);
      }
    } catch (error) {
      console.error("Error loading staff:", error);
      setStaff([]);
    } finally {
      setLoading(false);
    }
  };

  const filterStaff = () => {
    let filtered = staff;

    if (searchTerm) {
      filtered = filtered.filter(
        (s) =>
          s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.staff_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.phone?.includes(searchTerm),
      );
    }

    if (statusFilter !== "all") {
      const statusValue = statusFilter === "active" ? 1 : 0;
      filtered = filtered.filter((s) => s.status === statusValue);
    }

    setFilteredStaff(filtered);
  };

  const handleEdit = (staffMember) => {
    setSelectedStaff(staffMember);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("តើអ្នកប្រាកដថាចង់លុបបុគ្គលិកនេះទេ?")) {
      return;
    }

    try {
      const response = await deleteStaff(id);
      if (response.success) {
        loadStaff();
      }
    } catch (error) {
      console.error("Error deleting staff:", error);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const response = await toggleStaffStatus(id);
      if (response.success) {
        loadStaff();
      }
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedStaff(null);
    loadStaff();
  };

  const handleViewDetail = (staffMember) => {
    setDetailStaff(staffMember);
    setShowDetailModal(true);
  };

  const handleReset = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredStaff.slice(startIndex, endIndex);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("km-KH");
  };

  const getPhotoSrc = (photo) => {
    if (!photo || photo.trim() === "") return null;
    if (photo.startsWith("data:")) return photo;
    if (/^[A-Za-z0-9+/=]+$/.test(photo))
      return `data:image/jpeg;base64,${photo}`;
    if (photo.startsWith("http://") || photo.startsWith("https://"))
      return photo;
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl  p-8 ">
          <div className="absolute inset-0 bg-black/5" />
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <Users className="h-8 w-8 black" />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold text-black drop-shadow-lg">
                    បុគ្គលិក
                  </h1>
                  <p className="text-black mt-1">
                    គ្រប់គ្រងបុគ្គលិកទាំងអស់នៅក្នុងប្រព័ន្ធ ({totalItems})
                  </p>
                </div>
              </div>
              <SuperAdminOnly fallback={null}>
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-blue-50 text-blue-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  <Plus className="h-5 w-5" />
                  បន្ថែមបុគ្គលិក
                </button>
              </SuperAdminOnly>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl  p-6 border border-slate-200">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="ស្វែងរកតាមឈ្មោះ, លេខកូដ, ទូរស័ព្ទ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="all">ស្ថានភាពទាំងអស់</option>
                  <option value="active">សកម្ម</option>
                  <option value="inactive">អសកម្ម</option>
                </select>

                <button
                  onClick={handleReset}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all"
                  title="កំណត់ឡើងវិញ"
                >
                  <RefreshCw className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setViewMode("table")}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    viewMode === "table"
                      ? "bg-white text-blue-600 shadow-md"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <List className="h-4 w-4" />
                  តារាង
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    viewMode === "grid"
                      ? "bg-white text-blue-600 shadow-md"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Grid3x3 className="h-4 w-4" />
                  ក្រឡា
                </button>
              </div>

              <div className="text-sm text-slate-600 font-medium">
                សរុប: {filteredStaff.length} បុគ្គលិក
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-slate-200">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
            <p className="text-slate-600 font-semibold">
              កំពុងទាញយកទិន្នន័យ...
            </p>
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-slate-200">
            <Users className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-700 mb-2">
              {searchTerm || statusFilter !== "all"
                ? "មិនមានលទ្ធផលស្វែងរក"
                : "មិនមានបុគ្គលិក"}
            </h3>
            <p className="text-slate-500 mb-6">
              {searchTerm || statusFilter !== "all"
                ? "សូមព្យាយាមស្វែងរកជាមួយពាក្យគន្លឹះផ្សេង"
                : "មិនមានបុគ្គលិកនៅក្នុងប្រព័ន្ធទេនៅឡើយ"}
            </p>
            {(searchTerm || statusFilter !== "all") && (
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg transition-all"
              >
                សម្អាតការស្វែងរក
              </button>
            )}
            <SuperAdminOnly fallback={null}>
              {!searchTerm && statusFilter === "all" && (
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg transition-all"
                >
                  <Plus className="h-5 w-5" />
                  បន្ថែមបុគ្គលិកដំបូង
                </button>
              )}
            </SuperAdminOnly>
          </div>
        ) : (
          <>
            {/* Table View */}
            {viewMode === "table" && (
              <div className="bg-white rounded-2xl  overflow-hidden border border-slate-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                          បុគ្គលិក
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                          តួនាទី
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                          ទូរស័ព្ទ
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                          ថ្ងៃកំណើត
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                          ភេទ
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                          ស្ថានភាព
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">
                          សកម្មភាព
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                      {getCurrentPageItems().map((staffMember) => (
                        <tr
                          key={staffMember.id}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              {getPhotoSrc(staffMember.photo) ? (
                                <img
                                  src={getPhotoSrc(staffMember.photo)}
                                  alt={staffMember.name}
                                  className="h-12 w-12 rounded-full object-cover border-2 border-blue-200 shadow-sm"
                                />
                              ) : (
                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center shadow-sm">
                                  <User className="h-6 w-6 text-blue-600" />
                                </div>
                              )}
                              <div>
                                <div className="text-sm font-bold text-slate-900">
                                  {staffMember.name}
                                </div>
                                <div className="text-xs text-slate-500">
                                  {staffMember.staff_id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 rounded-full text-xs font-bold">
                              {staffMember.Role?.name || "N/A"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1 text-sm text-slate-600">
                              <Phone className="h-4 w-4" />
                              {staffMember.phone}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1 text-sm text-slate-600">
                              <Calendar className="h-4 w-4" />
                              {formatDate(staffMember.dob)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                            {staffMember.gender}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleToggleStatus(staffMember.id)}
                              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                                staffMember.status === 1
                                  ? "bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 hover:shadow-md"
                                  : "bg-gradient-to-r from-red-100 to-red-200 text-red-800 hover:shadow-md"
                              }`}
                            >
                              {staffMember.status === 1 ? "សកម្ម" : "អសកម្ម"}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleViewDetail(staffMember)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                title="មើលលម្អិត"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <SuperAdminOnly fallback={null}>
                                <button
                                  onClick={() => handleEdit(staffMember)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                  title="កែប្រែ"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(staffMember.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                  title="លុប"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </SuperAdminOnly>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Grid View */}
            {viewMode === "grid" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getCurrentPageItems().map((staffMember) => (
                  <div
                    key={staffMember.id}
                    className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-200 hover:border-blue-300"
                  >
                    {/* Card Header */}
                    <div className="relative h-24 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
                      <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
                        {getPhotoSrc(staffMember.photo) ? (
                          <img
                            src={getPhotoSrc(staffMember.photo)}
                            alt={staffMember.name}
                            className="h-20 w-20 rounded-full object-cover border-4 border-white shadow-xl ring-4 ring-blue-100"
                          />
                        ) : (
                          <div className="h-20 w-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center border-4 border-white shadow-xl ring-4 ring-blue-100">
                            <User className="h-10 w-10 text-blue-600" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="pt-14 px-6 pb-6 space-y-4">
                      <div className="text-center">
                        <h3 className="text-lg font-bold text-slate-900">
                          {staffMember.name}
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">
                          {staffMember.staff_id}
                        </p>
                      </div>

                      {/* Info */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Briefcase className="h-4 w-4 text-blue-500" />
                          <span className="truncate">
                            {staffMember.Role?.name || "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Phone className="h-4 w-4 text-green-500" />
                          <span>{staffMember.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Calendar className="h-4 w-4 text-purple-500" />
                          <span>{formatDate(staffMember.dob)}</span>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="pt-3 border-t border-slate-200">
                        <button
                          onClick={() => handleToggleStatus(staffMember.id)}
                          className={`w-full px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                            staffMember.status === 1
                              ? "bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800"
                              : "bg-gradient-to-r from-red-100 to-red-200 text-red-800"
                          }`}
                        >
                          {staffMember.status === 1 ? "សកម្ម" : "អសកម្ម"}
                        </button>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-3">
                        <button
                          onClick={() => handleViewDetail(staffMember)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-50 hover:bg-green-100 text-green-600 font-semibold rounded-lg transition-all"
                        >
                          <Eye className="h-4 w-4" />
                          មើល
                        </button>
                        <SuperAdminOnly fallback={null}>
                          <button
                            onClick={() => handleEdit(staffMember)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold rounded-lg transition-all"
                          >
                            <Edit className="h-4 w-4" />
                            កែប្រែ
                          </button>
                          <button
                            onClick={() => handleDelete(staffMember.id)}
                            className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all"
                            title="លុប"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </SuperAdminOnly>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white rounded-2xl shadow-lg px-6 py-4 border border-slate-200">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-slate-600 font-medium">
                    បង្ហាញ {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                    {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} នៃ{" "}
                    {totalItems} បុគ្គលិក
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border-2 border-slate-200 rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-all flex items-center gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      មុន
                    </button>
                    <div className="flex items-center gap-2">
                      {[...Array(Math.min(5, totalPages))].map((_, i) => {
                        const page = i + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => goToPage(page)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                              currentPage === page
                                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md"
                                : "border-2 border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border-2 border-slate-200 rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-all flex items-center gap-1"
                    >
                      បន្ទាប់
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Staff Form Modal */}
      {showForm && (
        <StaffForm staff={selectedStaff} onClose={handleFormClose} />
      )}

      {/* Detail Modal */}
      {showDetailModal && detailStaff && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="relative h-32 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-t-2xl">
              <button
                onClick={() => setShowDetailModal(false)}
                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all"
              >
                <X className="h-5 w-5 text-white" />
              </button>
              <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
                {getPhotoSrc(detailStaff.photo) ? (
                  <img
                    src={getPhotoSrc(detailStaff.photo)}
                    alt={detailStaff.name}
                    className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-2xl ring-4 ring-blue-100"
                  />
                ) : (
                  <div className="h-32 w-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center border-4 border-white shadow-2xl ring-4 ring-blue-100">
                    <User className="h-16 w-16 text-blue-600" />
                  </div>
                )}
              </div>
            </div>

            {/* Modal Body */}
            <div className="pt-20 px-8 pb-8 space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-900">
                  {detailStaff.name}
                </h2>
                <p className="text-slate-500 mt-1">{detailStaff.staff_id}</p>
                <div className="mt-3">
                  <span
                    className={`inline-flex px-4 py-2 rounded-full text-sm font-bold ${
                      detailStaff.status === 1
                        ? "bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800"
                        : "bg-gradient-to-r from-red-100 to-red-200 text-red-800"
                    }`}
                  >
                    {detailStaff.status === 1 ? "សកម្ម" : "អសកម្ម"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-xs text-slate-500">តួនាទី</p>
                      <p className="font-semibold text-slate-900">
                        {detailStaff.Role?.name || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                    <Phone className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-xs text-slate-500">ទូរស័ព្ទ</p>
                      <p className="font-semibold text-slate-900">
                        {detailStaff.phone}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-xs text-slate-500">ថ្ងៃកំណើត</p>
                      <p className="font-semibold text-slate-900">
                        {formatDate(detailStaff.dob)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                    <User className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="text-xs text-slate-500">ភេទ</p>
                      <p className="font-semibold text-slate-900">
                        {detailStaff.gender}
                      </p>
                    </div>
                  </div>

                  {detailStaff.email && (
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                      <Mail className="h-5 w-5 text-red-600" />
                      <div>
                        <p className="text-xs text-slate-500">អ៊ីមែល</p>
                        <p className="font-semibold text-slate-900">
                          {detailStaff.email}
                        </p>
                      </div>
                    </div>
                  )}

                  {detailStaff.address && (
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                      <MapPin className="h-5 w-5 text-pink-600" />
                      <div>
                        <p className="text-xs text-slate-500">អាសយដ្ឋាន</p>
                        <p className="font-semibold text-slate-900">
                          {detailStaff.address}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t border-slate-200">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all"
                >
                  បិទ
                </button>
                <SuperAdminOnly fallback={null}>
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      handleEdit(detailStaff);
                    }}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Edit className="h-5 w-5" />
                    កែប្រែ
                  </button>
                </SuperAdminOnly>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffList;
