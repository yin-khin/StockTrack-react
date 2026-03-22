// src/pages/roles/RoleList.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Shield, 
  ShieldOff,
  Filter,
  RefreshCw,
  AlertCircle,
  Users,
  Key,
  Loader2,
  CheckCircle,
  XCircle,
  Info
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { SuperAdminOnly } from "../../utils/permissions";
import axios from "../../api/axios";

const RoleList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchRoles();
  }, []);

  // Auto-hide notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (message, type = "info") => {
    setNotification({ message, type });
  };

  const fetchRoles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('/api/roles');
      
      if (response.data) {
        const rolesData = response.data.roles || response.data || [];
        setRoles(rolesData);
        
        if (rolesData.length === 0) {
          showNotification("ទិន្នន័យមិនមានទេ", "info");
        } else {
          showNotification(`ទាញយកទិន្នន័យតួនាទី ${rolesData.length} បានជោគជ័យ`, "success");
        }
      } else {
        const errorMsg = "មិនអាចទាញយកទិន្នន័យតួនាទីបានទេ";
        setError(errorMsg);
        showNotification(errorMsg, "error");
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
      const errorMessage = error.response?.data?.message || "មិនអាចទាញយកទិន្នន័យតួនាទីបានទេ";
      setError(errorMessage);
      showNotification(errorMessage, "error");
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`តើអ្នកពិតជាចង់លុបតួនាទី "${name}" នេះមែនទេ?\n\nការលុបនេះមិនអាចត្រឡប់ក្រោយបានទេ។`)) {
      return;
    }

    try {
      setDeleteLoading(id);
      await axios.delete(`/api/roles/${id}`);
      
      showNotification(`តួនាទី "${name}" ត្រូវបានលុបដោយជោគជ័យ`, "success");
      
      fetchRoles();
    } catch (error) {
      console.error("Error deleting role:", error);
      const errorMessage = error.response?.data?.message || "មិនអាចលុបតួនាទីបានទេ";
      showNotification(errorMessage, "error");
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleView = (role) => {
    navigate(`/roles/${role.id}`, { state: { role } });
  };

  const handleEdit = (role) => {
    navigate(`/roles/edit/${role.id}`, { state: { role } });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Client-side filtering only
  };

  const handleReset = () => {
    setSearchTerm("");
    showNotification("បានសំអាតការស្វែងរក", "info");
  };

  const handleRefresh = () => {
    showNotification("កំពុងទាញយកទិន្នន័យឡើងវិញ...", "info");
    fetchRoles();
  };

  const filteredRoles = roles.filter(role =>
    role.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.permissions?.some(perm => 
      perm.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const getRoleIcon = (roleName) => {
    switch(roleName?.toUpperCase()) {
      case 'ADMIN':
        return <Shield className="h-5 w-5 text-purple-600" />;
      case 'SUPER_ADMIN':
        return <Key className="h-5 w-5 text-red-600" />;
      default:
        return <Users className="h-5 w-5 text-blue-600" />;
    }
  };

  const getRoleBadge = (roleName) => {
    const name = roleName?.toUpperCase();
    if (name === 'ADMIN' || name === 'SUPER_ADMIN') {
      return (
        <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
          {name}
        </span>
      );
    }
    return null;
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "info":
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationStyles = (type) => {
    switch(type) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800";
      case "error":
        return "bg-red-50 border-red-200 text-red-800";
      case "info":
        return "bg-blue-50 border-blue-200 text-blue-800";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      {/* Notification Area */}
      {notification && (
        <div className="fixed top-4 right-4 left-4 md:left-auto md:w-96 z-50 animate-fade-in-down">
          <div className={`${getNotificationStyles(notification.type)} border rounded-xl p-4 shadow-lg flex items-center gap-3`}>
            {getNotificationIcon(notification.type)}
            <div className="flex-1">
              <p className="font-medium">{notification.message}</p>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-200">
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-2xl font-bold text-gray-900">
                គ្រប់គ្រងតួនាទី
              </h1>
              <p className="text-gray-600 mt-1">
                គ្រប់គ្រងតួនាទី និងសិទ្ធិទាំងអស់ក្នុងប្រព័ន្ធ
              </p>
            </div>
          </div>
          
          <SuperAdminOnly fallback={null}>
            <Link
              to="/roles/new"
              className="group inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-5 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <Plus className="h-5 w-5" />
              <span>បង្កើតតួនាទីថ្មី</span>
            </Link>
          </SuperAdminOnly>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">ចំនួនតួនាទីសរុប</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{roles.length}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">តួនាទីដែលបានស្វែងរក</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{filteredRoles.length}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <Filter className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">សកម្មភាពចុងក្រោយ</p>
                <p className="text-sm font-semibold text-gray-900 mt-2">
                  {loading ? 'កំពុងផ្ទុក...' : 'ទាញយកដោយជោគជ័យ'}
                </p>
              </div>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                title="ទាញយកឡើងវិញ"
              >
                <RefreshCw className={`h-6 w-6 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="w-full md:w-auto md:flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="ស្វែងរកតួនាទីតាមឈ្មោះ ការពិពណ៌នា ឬសិទ្ធិ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="flex-1 md:flex-none bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 disabled:opacity-50"
              >
                <span className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  ស្វែងរក
                </span>
              </button>
              
              <button
                onClick={handleReset}
                className="flex-1 md:flex-none bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium transition-colors"
              >
                សំអាត
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <div>
              <p className="text-red-700 font-medium">{error}</p>
              <button
                onClick={fetchRoles}
                className="text-red-600 hover:text-red-800 text-sm font-medium mt-1"
              >
                ព្យាយាមម្តងទៀត
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="inline-flex flex-col items-center">
              <Loader2 className="h-12 w-12 text-purple-600 animate-spin mb-4" />
              <p className="text-gray-700 font-medium">កំពុងទាញយកទិន្នន័យតួនាទី...</p>
              <p className="text-gray-500 text-sm mt-2">សូមរង់ចាំមួយភ្លែត</p>
            </div>
          </div>
        ) : (
          /* Roles Table Section */
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {filteredRoles.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-gray-100 mb-6">
                  <ShieldOff className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  {searchTerm ? 'គ្មានតួនាទីត្រូវនឹងការស្វែងរកទេ' : 'គ្មានតួនាទីទេ'}
                </h3>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                  {searchTerm 
                    ? 'សូមព្យាយាមស្វែងរកដោយពាក្យផ្សេង ឬសំអាតការស្វែងរក'
                    : 'អ្នកមិនទាន់មានតួនាទីណាមួយនៅឡើយទេ។'
                  }
                </p>
                <SuperAdminOnly fallback={
                  <p className="text-gray-500">ទាក់ទង Admin ដើម្បីបន្ថែមតួនាទី។</p>
                }>
                  <Link
                    to="/roles/new"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
                  >
                    <Plus className="h-5 w-5" />
                    {searchTerm ? 'បង្កើតតួនាទីថ្មី' : 'បង្កើតតួនាទីដំបូង'}
                  </Link>
                </SuperAdminOnly>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            តួនាទី
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          ការពិពណ៌នា
                        </th>
                        {/* <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          ចំនួនសិទ្ធិ
                        </th> */}
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          សកម្មភាព
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredRoles.map((role, index) => (
                        <tr 
                          key={role.id} 
                          className={`hover:bg-gradient-to-r hover:from-gray-50 hover:to-white transition-colors duration-150 ${
                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          }`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className={`h-12 w-12 flex items-center justify-center rounded-xl ${
                                role.name?.toUpperCase() === 'ADMIN' 
                                  ? 'bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100'
                                  : role.name?.toUpperCase() === 'SUPER_ADMIN'
                                  ? 'bg-gradient-to-br from-red-50 to-orange-50 border border-red-100'
                                  : 'bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100'
                              }`}>
                                {getRoleIcon(role.name)}
                              </div>
                              <div className="ml-4">
                                <div className="flex items-center">
                                  <div className="text-sm font-semibold text-gray-900">
                                    {role.name}
                                  </div>
                                  {getRoleBadge(role.name)}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  ID: {role.id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs">
                              {role.description || (
                                <span className="text-gray-400 italic">គ្មានការពិពណ៌នា</span>
                              )}
                            </div>
                          </td>
                          {/* <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-medium text-gray-900">
                                {role.permissions?.length || 0}
                              </div>
                              <span className="text-gray-400 text-xs">សិទ្ធិ</span>
                            </div>
                          </td> */}
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <SuperAdminOnly fallback={
                              <span className="inline-flex items-center gap-1 text-gray-400 text-xs px-3 py-1.5 bg-gray-100 rounded-full">
                                <Eye className="h-3 w-3" />
                                អានបានតែប៉ុណ្ណោះ
                              </span>
                            }>
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleView(role)}
                                  className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors border border-blue-100"
                                  title="មើលលម្អិត"
                                >
                                  <Eye className="h-4 w-4" />
                                  <span className="text-sm font-medium">មើល</span>
                                </button>
                                
                                <button
                                  onClick={() => handleEdit(role)}
                                  className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors border border-indigo-100"
                                  title="កែប្រែ"
                                >
                                  <Edit className="h-4 w-4" />
                                  <span className="text-sm font-medium">កែប្រែ</span>
                                </button>
                                
                                {role.name !== 'ADMIN' && role.name !== 'SUPER_ADMIN' && (
                                  <button
                                    onClick={() => handleDelete(role.id, role.name)}
                                    disabled={deleteLoading === role.id}
                                    className="inline-flex items-center gap-1.5 text-red-600 hover:text-red-800 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors border border-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="លុប"
                                  >
                                    {deleteLoading === role.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-4 w-4" />
                                    )}
                                    <span className="text-sm font-medium">
                                      {deleteLoading === role.id ? 'កំពុងលុប...' : 'លុប'}
                                    </span>
                                  </button>
                                )}
                              </div>
                            </SuperAdminOnly>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Table Footer */}
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-3">
                    <div className="text-sm text-gray-600">
                      បានបង្ហាញ <span className="font-semibold">{filteredRoles.length}</span> នៃ <span className="font-semibold">{roles.length}</span> តួនាទី
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                        <span className="text-xs text-gray-600">តួនាទីធម្មតា</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-purple-500"></div>
                        <span className="text-xs text-gray-600">តួនាទី Admin</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-red-500"></div>
                        {/* <span className="text-xs text-gray-600">តួនាទី Super Admin</span> */}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

      </div>

      {/* Add custom animation */}
      <style jsx>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-down {
          animation: fadeInDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default RoleList;