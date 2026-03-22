/* eslint-disable react-hooks/exhaustive-deps */
// src/pages/users/UserList.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  Grid3x3,
  List,
  Mail,
  Phone,
  Shield,
  Calendar,
  Filter,
  Download,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  AdminOnly,
  canViewUser,
  canCreateUser,
  canEditUser,
  canDeleteUser,
} from "../../utils/permissions";
import { getUsers, deleteUser, updateUser } from "../../api/user.api";

const UserList = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'grid'
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Permission checks
  const canView = canViewUser(currentUser);
  const canCreate = canCreateUser(currentUser);
  const canEdit = canEditUser(currentUser);
  const canDelete = canDeleteUser(currentUser);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm, filterRole, filterStatus]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
      };

      const response = await getUsers(params);

      if (response && (response.users || response.data)) {
        let fetchedUsers = response.users || response.data || [];
        
        // Apply filters
        if (filterRole !== "all") {
          fetchedUsers = fetchedUsers.filter(u => u.Role?.name === filterRole);
        }
        if (filterStatus !== "all") {
          fetchedUsers = fetchedUsers.filter(u => u.status === filterStatus);
        }
        
        setUsers(fetchedUsers);
        const count = response.count || fetchedUsers.length || 0;
        setTotalPages(Math.ceil(count / 10));
      } else {
        setError("មិនអាចទាញយកទិន្នន័យអ្នកប្រើប្រាស់បានទេ");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("មិនអាចទាញយកទិន្នន័យអ្នកប្រើប្រាស់បានទេ");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`តើអ្នកពិតជាចង់លុបអ្នកប្រើប្រាស់ "${name}" មែនទេ?`)) {
      try {
        await deleteUser(id);
        fetchUsers();
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("មិនអាចលុបអ្នកប្រើប្រាស់បានទេ");
      }
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    try {
      await updateUser(id, {
        status: currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE",
      });
      fetchUsers();
    } catch (error) {
      console.error("Error updating user status:", error);
      alert("មិនអាចកែប្រែស្ថានភាពអ្នកប្រើប្រាស់បានទេ");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers();
  };

  const handleReset = () => {
    setSearchTerm("");
    setFilterRole("all");
    setFilterStatus("all");
    setCurrentPage(1);
    setTimeout(() => {
      fetchUsers();
    }, 100);
  };

  if (!canView) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl">
          <UserX className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            មិនមានសិទ្ធិចូលប្រើ
          </h3>
          <p className="text-gray-500">អ្នកមិនមានសិទ្ធិមើលបញ្ជីអ្នកប្រើប្រាស់ទេ</p>
        </div>
      </div>
    );
  }

  return (
    <AdminOnly
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
          <div className="text-center p-8 bg-white rounded-2xl shadow-xl">
            <UserX className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              មិនមានសិទ្ធិចូលប្រើ
            </h3>
            <p className="text-gray-500">
              តែ Admin ប៉ុណ្ណោះដែលអាចមើលឃើញអ្នកប្រើប្រាស់បាន
            </p>
          </div>
        </div>
      }
    >
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-8 shadow-xl">
            <div className="absolute inset-0 bg-black/10" />
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <UserCheck className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-extrabold text-white drop-shadow-lg">
                      អ្នកប្រើប្រាស់
                    </h1>
                    <p className="text-blue-100 mt-1">
                      គ្រប់គ្រងអ្នកប្រើប្រាស់ទាំងអស់នៅក្នុងប្រព័ន្ធ
                    </p>
                  </div>
                </div>
                {canCreate && (
                  <Link
                    to="/users/new"
                    className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-blue-50 text-blue-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                  >
                    <Plus className="h-5 w-5" />
                    បន្ថែមអ្នកប្រើប្រាស់
                  </Link>
                )}
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
            <form onSubmit={handleSearch} className="space-y-4">
              {/* Search Bar */}
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="ស្វែងរកតាមឈ្មោះ ឬឈ្មោះអ្នកប្រើប្រាស់..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Filter Buttons */}
                <div className="flex gap-2">
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="all">តួនាទីទាំងអស់</option>
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                    <option value="Staff">Staff</option>
                  </select>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="all">ស្ថានភាពទាំងអស់</option>
                    <option value="ACTIVE">សកម្ម</option>
                    <option value="INACTIVE">អសកម្ម</option>
                  </select>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all flex items-center gap-2"
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
                    type="button"
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
                    type="button"
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
                  សរុប: {users.length} អ្នកប្រើប្រាស់
                </div>
              </div>
            </form>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-xl bg-red-50 border-2 border-red-200 p-4 flex items-center gap-3">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <UserX className="h-5 w-5 text-red-600" />
              </div>
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-slate-200">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
              <p className="text-slate-600 font-semibold">កំពុងទាញយកទិន្នន័យ...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-slate-200">
              <UserCheck className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-700 mb-2">គ្មានអ្នកប្រើប្រាស់ទេ</h3>
              <p className="text-slate-500 mb-6">មិនមានអ្នកប្រើប្រាស់នៅក្នុងប្រព័ន្ធទេនៅឡើយ</p>
              {canCreate && (
                <Link
                  to="/users/new"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg transition-all"
                >
                  <Plus className="h-5 w-5" />
                  បន្ថែមអ្នកប្រើប្រាស់ដំបូង
                </Link>
              )}
            </div>
          ) : (
            <>
              {/* Table View */}
              {viewMode === "table" && (
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                            អ្នកប្រើប្រាស់
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                            អ៊ីម៉ែល
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                            តួនាទី
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                            ស្ថានភាព
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                            ថ្ងៃបង្កើត
                          </th>
                          <th className="px-6 py-4 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">
                            សកម្មភាព
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-100">
                        {users.map((user) => (
                          <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                {user.photo && user.photo.trim() !== "" ? (
                                  <img
                                    src={
                                      user.photo.startsWith("data:")
                                        ? user.photo
                                        : `data:image/jpeg;base64,${user.photo}`
                                    }
                                    alt={user.name}
                                    className="h-12 w-12 rounded-full object-cover border-2 border-blue-200 shadow-sm"
                                    onError={(e) => {
                                      e.target.style.display = "none";
                                      e.target.nextSibling.style.display = "flex";
                                    }}
                                  />
                                ) : null}
                                <div
                                  className="h-12 w-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center shadow-sm"
                                  style={{
                                    display:
                                      user.photo && user.photo.trim() !== "" ? "none" : "flex",
                                  }}
                                >
                                  <span className="text-blue-600 font-bold text-lg">
                                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                                  </span>
                                </div>
                                <div>
                                  <div className="text-sm font-bold text-slate-900">
                                    {user.name}
                                  </div>
                                  <div className="text-xs text-slate-500 flex items-center gap-1">
                                    <Shield className="h-3 w-3" />
                                    {user.username}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="space-y-1">
                                {user.email && (
                                  <div className="text-xs text-slate-600 flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    {user.email}
                                  </div>
                                )}
                                {user.phone && (
                                  <div className="text-xs text-slate-600 flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {user.phone}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 rounded-full text-xs font-bold">
                                {user.Role?.name || "N/A"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                onClick={() => handleStatusToggle(user.id, user.status)}
                                disabled={!canEdit}
                                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                                  user.status === "ACTIVE"
                                    ? "bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 hover:shadow-md"
                                    : "bg-gradient-to-r from-red-100 to-red-200 text-red-800 hover:shadow-md"
                                } ${
                                  canEdit
                                    ? "cursor-pointer"
                                    : "cursor-not-allowed opacity-50"
                                }`}
                              >
                                {user.status === "ACTIVE" ? "សកម្ម" : "អសកម្ម"}
                              </button>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-xs text-slate-600 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(user.createdAt).toLocaleDateString("km-KH")}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="flex items-center justify-end gap-2">
                                {canView && (
                                  <Link
                                    to={`/users/${user.id}`}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                    title="មើល"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Link>
                                )}
                                {canEdit && (
                                  <Link
                                    to={`/users/edit/${user.id}`}
                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                    title="កែប្រែ"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Link>
                                )}
                                {canDelete && (
                                  <button
                                    onClick={() => handleDelete(user.id, user.name)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                    title="លុប"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                )}
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
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-200 hover:border-blue-300"
                    >
                      {/* Card Header */}
                      <div className="relative h-24 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
                        <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
                          {user.photo && user.photo.trim() !== "" ? (
                            <img
                              src={
                                user.photo.startsWith("data:")
                                  ? user.photo
                                  : `data:image/jpeg;base64,${user.photo}`
                              }
                              alt={user.name}
                              className="h-20 w-20 rounded-full object-cover border-4 border-white shadow-xl ring-4 ring-blue-100"
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "flex";
                              }}
                            />
                          ) : null}
                          <div
                            className="h-20 w-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center border-4 border-white shadow-xl ring-4 ring-blue-100"
                            style={{
                              display:
                                user.photo && user.photo.trim() !== "" ? "none" : "flex",
                            }}
                          >
                            <span className="text-blue-600 font-bold text-2xl">
                              {user.name?.charAt(0)?.toUpperCase() || "U"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="pt-14 px-6 pb-6 space-y-4">
                        <div className="text-center">
                          <h3 className="text-lg font-bold text-slate-900">{user.name}</h3>
                          <p className="text-sm text-slate-500 flex items-center justify-center gap-1 mt-1">
                            <Shield className="h-3 w-3" />
                            {user.username}
                          </p>
                        </div>

                        {/* Info */}
                        <div className="space-y-2">
                          {user.email && (
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Mail className="h-4 w-4 text-blue-500" />
                              <span className="truncate">{user.email}</span>
                            </div>
                          )}
                          {user.phone && (
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Phone className="h-4 w-4 text-green-500" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                        </div>

                        {/* Role & Status */}
                        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                          <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 rounded-full text-xs font-bold">
                            {user.Role?.name || "N/A"}
                          </span>
                          <button
                            onClick={() => handleStatusToggle(user.id, user.status)}
                            disabled={!canEdit}
                            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                              user.status === "ACTIVE"
                                ? "bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800"
                                : "bg-gradient-to-r from-red-100 to-red-200 text-red-800"
                            } ${
                              canEdit ? "cursor-pointer hover:shadow-md" : "cursor-not-allowed opacity-50"
                            }`}
                          >
                            {user.status === "ACTIVE" ? "សកម្ម" : "អសកម្ម"}
                          </button>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-center gap-2 pt-3">
                          {canView && (
                            <Link
                              to={`/users/${user.id}`}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold rounded-lg transition-all"
                            >
                              <Eye className="h-4 w-4" />
                              មើល
                            </Link>
                          )}
                          {canEdit && (
                            <Link
                              to={`/users/edit/${user.id}`}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-semibold rounded-lg transition-all"
                            >
                              <Edit className="h-4 w-4" />
                              កែប្រែ
                            </Link>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(user.id, user.name)}
                              className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all"
                              title="លុប"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
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
                      ទំព័រ {currentPage} នៃ {totalPages}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 border-2 border-slate-200 rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-all"
                      >
                        មុន
                      </button>
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 border-2 border-slate-200 rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-all"
                      >
                        បន្ទាប់
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AdminOnly>
  );
};

export default UserList;