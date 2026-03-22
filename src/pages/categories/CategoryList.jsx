/* eslint-disable eqeqeq */
// src/pages/categories/CategoryList.jsx
import React, { useEffect, useState, useMemo } from "react";
import { fetchCategories, deleteCategory } from "../../api/category.api";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Tag,
  X,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Sparkles,
  Grid3x3,
  Image as ImageIcon,
  TrendingUp,
  Layers,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { AdminOnly, can } from "../../utils/permissions";
import CategoryForm from "./CategoryForm";

const ITEMS_PER_PAGE = 12;
const CATEGORY_STATUS = {
  ACTIVE: 1,
  INACTIVE: 0,
};

const CategoryList = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'table'
  const [imageErrors, setImageErrors] = useState(new Set());

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Permission checks
  const canCreate = can(user, "category", "create");
  const canEdit = can(user, "category", "edit");
  const canDelete = can(user, "category", "delete");

  useEffect(() => {
    getCategories();
  }, []);

  useEffect(() => {
    const filtered = categories.filter((category) =>
      category.name?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredCategories(filtered);
    setCurrentPage(1);
  }, [searchTerm, categories]);

  const getCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchCategories();
      const categoriesArray = Array.isArray(data) ? data : [];
      const sortedCategories = categoriesArray.sort((a, b) => b.id - a.id);
      setCategories(sortedCategories);
      setFilteredCategories(sortedCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError("មិនអាចទាញយកបញ្ជីប្រភេទបានទេ");
      setCategories([]);
      setFilteredCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("តើអ្នកពិតជាចង់លុបប្រភេទនេះមែនទេ?")) {
      return;
    }

    try {
      setDeleting(id);
      await deleteCategory(id);
      getCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      setError("មិនអាចលុបប្រភេទបានទេ");
    } finally {
      setDeleting(null);
    }
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setShowForm(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category.id);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingCategory(null);
  };

  const handleFormSuccess = () => {
    getCategories();
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handleImageError = (categoryId) => {
    setImageErrors((prev) => new Set(prev).add(categoryId));
  };

  // Statistics
  const stats = useMemo(() => {
    return categories.reduce(
      (acc, cat) => {
        acc.total++;
        if (cat.status === CATEGORY_STATUS.ACTIVE) acc.active++;
        else acc.inactive++;
        if (cat.image) acc.withImage++;
        return acc;
      },
      { total: 0, active: 0, inactive: 0, withImage: 0 },
    );
  }, [categories]);

  // Pagination
  const totalItems = filteredCategories.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCategories.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredCategories, currentPage]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 md:p-6 lg:p-8">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Kantumruy+Pro:ital,wght@0,100..700;1,100..700&family=Merienda:wght@300..900&display=swap');
        
        * {
          font-family: 'Kantumruy Pro',  sans-serif;
        }
        
        .stat-card {
          position: relative;
          overflow: hidden;
        }
        
        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.4) 100%);
          z-index: 0;
        }
        
        .stat-card > * {
          position: relative;
          z-index: 1;
        }
        
        .category-card {
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          position: relative;
        }
        
        .category-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 1.5rem;
          padding: 2px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .category-card:hover::before {
          opacity: 1;
        }
        
        .category-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 60px -15px rgba(102, 126, 234, 0.4);
        }
        
        .category-image {
          transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .category-card:hover .category-image {
          transform: scale(1.1) rotate(2deg);
        }
        
        .shimmer {
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.6) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        .glow-button {
          position: relative;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          transition: all 0.3s ease;
        }
        
        .glow-button::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: inherit;
          background: linear-gradient(135deg, #667eea, #764ba2, #f093fb);
          z-index: -1;
          opacity: 0;
          filter: blur(10px);
          transition: opacity 0.3s ease;
        }
        
        .glow-button:hover::before {
          opacity: 0.7;
        }
        
        .glow-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px -5px rgba(102, 126, 234, 0.5);
        }
        
        .fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .stagger-1 { animation-delay: 0.1s; }
        .stagger-2 { animation-delay: 0.2s; }
        .stagger-3 { animation-delay: 0.3s; }
        .stagger-4 { animation-delay: 0.4s; }
      `}</style>

      <div className="max-w-7xl mx-auto">
        {/* Header with Gradient Accent */}
        <div className="mb-8 fade-in">
          <div className="relative">
            <div className="absolute -top-4 -left-4 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-3xl opacity-30 animate-pulse"></div>
            <div
              className="absolute -top-2 -right-8 w-40 h-40 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full blur-3xl opacity-20 animate-pulse"
              style={{ animationDelay: "1s" }}
            ></div>

            <div className="relative flex items-center gap-4 mb-3">
              <div className="h-11 w-11 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl transform hover:rotate-12 transition-transform duration-300">
                <Layers className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600">
                  បញ្ជីប្រភេទ
                </h1>
                <p className="text-gray-600 text-sm md:text-base font-medium mt-1 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  គ្រប់គ្រងប្រភេទផលិតផលទាំងអស់ប្រកបដោយស្ទាយល៍
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {[
            {
              label: "ប្រភេទសរុប",
              value: stats.total,
              sublabel: "ក្នុងប្រព័ន្ធ",
              icon: Tag,
              gradient: "from-violet-500 to-purple-500",
              bgGradient: "from-violet-50 to-purple-50",
              delay: "stagger-1",
            },
            {
              label: "សកម្ម",
              value: stats.active,
              sublabel: `${((stats.active / stats.total) * 100 || 0).toFixed(0)}% នៃសរុប`,
              icon: CheckCircle,
              gradient: "from-emerald-500 to-teal-500",
              bgGradient: "from-emerald-50 to-teal-50",
              delay: "stagger-2",
            },
            {
              label: "មិនសកម្ម",
              value: stats.inactive,
              sublabel: `${((stats.inactive / stats.total) * 100 || 0).toFixed(0)}% នៃសរុប`,
              icon: XCircle,
              gradient: "from-rose-500 to-pink-500",
              bgGradient: "from-rose-50 to-pink-50",
              delay: "stagger-3",
            },
            {
              label: "មានរូបភាព",
              value: stats.withImage,
              sublabel: `${((stats.withImage / stats.total) * 100 || 0).toFixed(0)}% បានបញ្ចូល`,
              icon: ImageIcon,
              gradient: "from-blue-500 to-cyan-500",
              bgGradient: "from-blue-50 to-cyan-50",
              delay: "stagger-4",
            },
          ].map((stat, index) => (
            <div
              key={index}
              className={`stat-card bg-gradient-to-br ${stat.bgGradient} rounded-2xl shadow-lg hover:shadow-2xl p-6 border border-white/50 backdrop-blur-sm transition-all duration-300 hover:scale-105 fade-in ${stat.delay}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-black mb-2 uppercase tracking-wide">
                    {stat.label}
                  </p>
                  <p className="text-4xl  text-black  bg-clip-text bg-gradient-to-r ${stat.gradient}">
                    {stat.value}
                  </p>
                  <p className="text-xs text-black mt-2 font-medium">
                    {stat.sublabel}
                  </p>
                </div>
                <div
                  className={`h-14 w-14 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center shadow-lg transform hover:rotate-12 transition-transform`}
                >
                  <stat.icon className="h-7 w-7 text-white" />
                </div>
              </div>
              <div className="h-1.5 bg-gray-200/50 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${stat.gradient} rounded-full shimmer`}
                  style={{
                    width: `${Math.min(100, (stat.value / stats.total) * 100 || 0)}%`,
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Search & Actions Bar */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 mb-8 border border-purple-100 fade-in">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-400 group-focus-within:text-purple-600 transition-colors" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ស្វែងរកប្រភេទ..."
                className="w-full pl-14 pr-14 py-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-400 transition-all text-gray-800 font-medium placeholder:text-purple-300"
              />
              {searchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-purple-400 hover:text-purple-600 transition-colors p-1 hover:bg-purple-100 rounded-lg"
                  aria-label="Clear search"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* View Toggle */}
            <div className="flex gap-2 bg-gradient-to-r from-purple-50 to-indigo-50 p-1 rounded-xl border-2 border-purple-200">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-4 py-3 rounded-lg font-semibold text-sm transition-all ${
                  viewMode === "grid"
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg"
                    : "text-purple-600 hover:bg-white/50"
                }`}
                aria-label="Grid view"
              >
                <Grid3x3 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-4 py-3 rounded-lg font-semibold text-sm transition-all ${
                  viewMode === "table"
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg"
                    : "text-purple-600 hover:bg-white/50"
                }`}
                aria-label="Table view"
              >
                <Layers className="h-5 w-5" />
              </button>
            </div>

            {/* Refresh Button */}
            <button
              onClick={getCategories}
              disabled={loading}
              className="bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-md hover:shadow-lg border-2 border-gray-300"
              aria-label="Refresh"
            >
              <RefreshCw
                className={`h-5 w-5 ${loading ? "animate-spin" : ""}`}
              />
              <span className="hidden md:inline">ផ្ទុកឡើងវិញ</span>
            </button>

            {/* Add Button */}
            <AdminOnly>
              {canCreate && (
                <button
                  onClick={handleAddCategory}
                  className="glow-button text-white px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl border-2 border-purple-400"
                  aria-label="Add new category"
                >
                  <Plus className="h-5 w-5" />
                  <span className="hidden md:inline">បន្ថែមប្រភេទថ្មី</span>
                </button>
              )}
            </AdminOnly>
          </div>

          {/* Search Results Info */}
          {searchTerm && (
            <div className="mt-4 text-sm font-semibold text-purple-600 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              រកឃើញ{" "}
              <span className="px-3 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg">
                {filteredCategories.length}
              </span>{" "}
              លទ្ធផល
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-5 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 rounded-xl text-red-700 flex items-center gap-3 shadow-lg fade-in">
            <AlertCircle className="h-6 w-6 flex-shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-16 text-center border border-purple-100">
            <div className="inline-block relative">
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-purple-200"></div>
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-t-purple-600 border-r-transparent border-b-transparent border-l-transparent absolute top-0 left-0"></div>
            </div>
            <p className="mt-6 text-gray-600 font-bold text-lg">
              កំពុងទាញយកទិន្នន័យ...
            </p>
            <div className="mt-4 flex justify-center gap-1">
              <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
          </div>
        ) : totalItems === 0 ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-16 text-center border border-purple-100">
            <div className="h-32 w-32 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Tag className="h-16 w-16 text-purple-400" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-3">
              {searchTerm ? "គ្មានលទ្ធផលស្វែងរក" : "គ្មានប្រភេទទេ"}
            </h3>
            <p className="text-gray-600 mb-8 font-medium text-lg">
              {searchTerm
                ? "សូមព្យាយាមស្វែងរកជាមួយពាក្យគន្លឹះផ្សេង"
                : canCreate
                  ? "ចាប់ផ្តើមដោយបន្ថែមប្រភេទថ្មី"
                  : "មិនមានប្រភេទសម្រាប់បង្ហាញទេ"}
            </p>
            {searchTerm ? (
              <button
                onClick={handleClearSearch}
                className="glow-button inline-flex items-center px-8 py-4 text-white rounded-xl font-bold shadow-2xl"
              >
                <X className="h-5 w-5 mr-2" />
                សម្អាតការស្វែងរក
              </button>
            ) : canCreate ? (
              <button
                onClick={handleAddCategory}
                className="glow-button inline-flex items-center px-8 py-4 text-white rounded-xl font-bold shadow-2xl"
              >
                <Plus className="h-5 w-5 mr-2" />
                បង្កើតប្រភេទថ្មី
              </button>
            ) : null}
          </div>
        ) : viewMode === "grid" ? (
          /* Grid View */
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedCategories.map((category, index) => (
                <div
                  key={category.id}
                  className="category-card bg-white rounded-2xl shadow-lg overflow-hidden border border-purple-100 fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Image Section */}
                  <div className="relative h-48 bg-gradient-to-br from-purple-100 via-indigo-100 to-blue-100 overflow-hidden">
                    {category.image && !imageErrors.has(category.id) ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="category-image w-full h-full object-cover"
                        onError={() => handleImageError(category.id)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Tag className="h-20 w-20 text-purple-300" />
                      </div>
                    )}

                    {/* ID Badge */}
                    <div className="absolute top-3 left-3 px-3 py-1 bg-black/40 backdrop-blur-md rounded-lg border border-white/20">
                      <span className="text-white font-black text-sm font-mono">
                        #{category.id}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold backdrop-blur-md border ${
                          category.status === CATEGORY_STATUS.ACTIVE
                            ? "bg-emerald-500/90 text-white border-emerald-300"
                            : "bg-rose-500/90 text-white border-rose-300"
                        }`}
                      >
                        {category.status === CATEGORY_STATUS.ACTIVE ? (
                          <>
                            <CheckCircle className="h-3 w-3" />
                            សកម្ម
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3" />
                            មិនសកម្ម
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-5">
                    <h3 className="text-lg font-black text-gray-900 mb-4 truncate">
                      {category.name}
                    </h3>

                    {/* Action Buttons */}
                    <AdminOnly>
                      <div className="flex gap-2">
                        {canEdit && (
                          <button
                            onClick={() => handleEditCategory(category)}
                            className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-4 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                            aria-label={`Edit ${category.name}`}
                          >
                            <Edit className="h-4 w-4" />
                            កែសម្រួល
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(category.id)}
                            disabled={deleting === category.id}
                            className="flex-1 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white px-4 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label={`Delete ${category.name}`}
                          >
                            {deleting === category.id ? (
                              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <>
                                <Trash2 className="h-4 w-4" />
                                លុប
                              </>
                            )}
                          </button>
                        )}
                        {!canEdit && !canDelete && (
                          <span className="text-gray-400 text-sm font-semibold text-center w-full py-3">
                            មិនមានសកម្មភាព
                          </span>
                        )}
                      </div>
                    </AdminOnly>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination for Grid */}
            {totalPages > 1 && (
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-purple-100">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm font-bold text-gray-700">
                    បង្ហាញ{" "}
                    <span className="text-purple-600">
                      {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                      {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}
                    </span>{" "}
                    នៃ <span className="text-purple-600">{totalItems}</span>{" "}
                    ប្រភេទ
                  </div>

                  <nav className="flex items-center gap-2 flex-wrap justify-center">
                    <button
                      onClick={() => goToPage(1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border-2 border-purple-300 rounded-lg text-sm font-bold text-purple-600 bg-white hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      « ដើម
                    </button>

                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border-2 border-purple-300 rounded-lg text-sm font-bold text-purple-600 bg-white hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      មុន
                    </button>

                    {renderPageButtons().map((p, idx) =>
                      p === "..." ? (
                        <span
                          key={`dots-${idx}`}
                          className="px-2 text-purple-400 font-black"
                        >
                          …
                        </span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => goToPage(p)}
                          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all transform hover:scale-110 ${
                            currentPage === p
                              ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg border-2 border-purple-400"
                              : "border-2 border-purple-300 bg-white text-purple-600 hover:bg-purple-50"
                          }`}
                        >
                          {p}
                        </button>
                      ),
                    )}

                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border-2 border-purple-300 rounded-lg text-sm font-bold text-purple-600 bg-white hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      បន្ទាប់
                    </button>

                    <button
                      onClick={() => goToPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border-2 border-purple-300 rounded-lg text-sm font-bold text-purple-600 bg-white hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      ចុង »
                    </button>
                  </nav>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Table View */
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-purple-100">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-purple-200">
                <thead>
                  <tr className="bg-gradient-to-r from-purple-100 to-indigo-100">
                    <th className="px-6 py-5 text-left text-xs font-black text-purple-900 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-black text-purple-900 uppercase tracking-wider">
                      រូបភាព
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-black text-purple-900 uppercase tracking-wider">
                      ឈ្មោះ
                    </th>
                    <th className="px-6 py-5 text-center text-xs font-black text-purple-900 uppercase tracking-wider">
                      ស្ថានភាព
                    </th>
                    <th className="px-6 py-5 text-right text-xs font-black text-purple-900 uppercase tracking-wider">
                      សកម្មភាព
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-purple-100">
                  {paginatedCategories.map((category, index) => (
                    <tr
                      key={category.id}
                      className={`hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 transition-all fade-in ${
                        index % 2 === 0 ? "bg-white" : "bg-purple-50/30"
                      }`}
                      style={{ animationDelay: `${index * 0.03}s` }}
                    >
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-black rounded-lg shadow-md font-mono">
                          #{category.id}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        {category.image && !imageErrors.has(category.id) ? (
                          <img
                            src={category.image}
                            alt={category.name}
                            className="w-16 h-16 object-cover rounded-xl border-4 border-purple-200 shadow-lg transform hover:scale-110 transition-transform"
                            onError={() => handleImageError(category.id)}
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl flex items-center justify-center border-4 border-purple-200 shadow-lg">
                            <Tag className="h-8 w-8 text-purple-400" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className="text-base font-black text-gray-900">
                          {category.name}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-center">
                        <span
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black shadow-md ${
                            category.status === CATEGORY_STATUS.ACTIVE
                              ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
                              : "bg-gradient-to-r from-rose-500 to-pink-500 text-white"
                          }`}
                        >
                          {category.status === CATEGORY_STATUS.ACTIVE ? (
                            <>
                              <CheckCircle className="h-4 w-4" />
                              សកម្ម
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4" />
                              មិនសកម្ម
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-right">
                        <AdminOnly>
                          <div className="flex items-center justify-end gap-3">
                            {canEdit && (
                              <button
                                onClick={() => handleEditCategory(category)}
                                className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 rounded-xl transition-all transform hover:scale-110 shadow-md hover:shadow-lg"
                                aria-label={`Edit ${category.name}`}
                              >
                                <Edit className="h-5 w-5" />
                              </button>
                            )}
                            {canDelete && (
                              <button
                                onClick={() => handleDelete(category.id)}
                                disabled={deleting === category.id}
                                className="p-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:from-rose-600 hover:to-pink-600 rounded-xl transition-all transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                                aria-label={`Delete ${category.name}`}
                              >
                                {deleting === category.id ? (
                                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <Trash2 className="h-5 w-5" />
                                )}
                              </button>
                            )}
                            {!canEdit && !canDelete && (
                              <span className="text-gray-400 text-sm font-bold">
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

            {/* Pagination for Table */}
            {totalPages > 1 && (
              <div className="px-6 py-5 flex flex-col sm:flex-row items-center justify-between border-t-2 border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50 gap-4">
                <div className="text-sm font-bold text-gray-700">
                  បង្ហាញ{" "}
                  <span className="text-purple-600">
                    {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                    {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}
                  </span>{" "}
                  នៃ <span className="text-purple-600">{totalItems}</span>{" "}
                  ប្រភេទ
                </div>

                <nav className="flex items-center gap-2 flex-wrap justify-center">
                  <button
                    onClick={() => goToPage(1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border-2 border-purple-300 rounded-lg text-sm font-bold text-purple-600 bg-white hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    « ដើម
                  </button>

                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border-2 border-purple-300 rounded-lg text-sm font-bold text-purple-600 bg-white hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    មុន
                  </button>

                  {renderPageButtons().map((p, idx) =>
                    p === "..." ? (
                      <span
                        key={`dots-${idx}`}
                        className="px-2 text-purple-400 font-black"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => goToPage(p)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all transform hover:scale-110 ${
                          currentPage === p
                            ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg border-2 border-purple-400"
                            : "border-2 border-purple-300 bg-white text-purple-600 hover:bg-purple-50"
                        }`}
                      >
                        {p}
                      </button>
                    ),
                  )}

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border-2 border-purple-300 rounded-lg text-sm font-bold text-purple-600 bg-white hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    បន្ទាប់
                  </button>

                  <button
                    onClick={() => goToPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border-2 border-purple-300 rounded-lg text-sm font-bold text-purple-600 bg-white hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    ចុង »
                  </button>
                </nav>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Category Form Modal */}
      <CategoryForm
        isOpen={showForm}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        categoryId={editingCategory}
      />
    </div>
  );
};

export default CategoryList;
