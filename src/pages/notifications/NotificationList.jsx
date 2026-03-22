// src/pages/notifications/NotificationList.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
  Bell,
  AlertCircle,
  Package,
  ShoppingCart,
  TrendingUp,
  Check,
  CheckCheck,
  Trash2,
  RefreshCw,
  Calendar,
  Filter,
  X,
  BellRing,
  BellOff,
  Archive,
} from "lucide-react";
import { useNotifications } from "../../context/NotificationContext";
import { deleteNotification } from "../../api/notification.api";
import { formatDistanceToNow } from "../../utils/dateUtils";

const ITEMS_PER_PAGE = 10;

const NotificationList = () => {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    loadNotifications,
  } = useNotifications();

  const [filter, setFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [deleting, setDeleting] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadNotifications({ limit: 100 });
  }, []);

  const getNotificationIcon = (type) => {
    switch (type) {
      case "low_stock":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "out_of_stock":
        return <Package className="h-5 w-5 text-red-500" />;
      case "sale_new":
        return <ShoppingCart className="h-5 w-5 text-green-500" />;
      case "purchase_new":
        return <TrendingUp className="h-5 w-5 text-blue-500" />;
      case "expiring_soon":
        return <Calendar className="h-5 w-5 text-orange-500" />;
      case "expiring_today":
        return <Calendar className="h-5 w-5 text-red-600" />;
      case "expired":
        return <Calendar className="h-5 w-5 text-red-700" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTypeLabel = (type) => {
    const labels = {
      low_stock: "ស្តុកទាប",
      out_of_stock: "អស់ស្តុក",
      sale_new: "ការលក់ថ្មី",
      purchase_new: "ការទិញថ្មី",
      expiring_soon: "ជិតផុតកំណត់",
      expiring_today: "ផុតកំណត់ថ្ងៃនេះ",
      expired: "បានផុតកំណត់",
    };
    return labels[type] || "ទូទៅ";
  };

  const formatNotificationTime = (createdAt) => {
    try {
      return formatDistanceToNow(new Date(createdAt), { addSuffix: true });
    } catch (error) {
      return "ថ្មីៗនេះ";
    }
  };

  const getCurrentExpirationStatus = (notification) => {
    const expireDate =
      notification.data?.expire_date || notification.Product?.expire_date;

    if (!expireDate) return null;

    const expiration = new Date(expireDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expiration.setHours(0, 0, 0, 0);

    const diffTime = expiration - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 7) return null;

    let statusClass = "";
    let statusText = "";
    let currentType = "";

    if (diffDays < 0) {
      statusClass = "bg-red-100 text-red-800 border-red-300";
      statusText = "បានផុតកំណត់";
      currentType = "expired";
    } else if (diffDays === 0) {
      statusClass = "bg-orange-100 text-orange-800 border-orange-300";
      statusText = "ផុតកំណត់ថ្ងៃនេះ";
      currentType = "expiring_today";
    } else if (diffDays <= 3) {
      statusClass = "bg-yellow-100 text-yellow-800 border-yellow-300";
      statusText = `នៅសល់ ${diffDays} ថ្ងៃ`;
      currentType = "expiring_soon";
    } else if (diffDays <= 7) {
      statusClass = "bg-blue-100 text-blue-800 border-blue-300";
      statusText = `នៅសល់ ${diffDays} ថ្ងៃ`;
      currentType = "expiring_soon";
    }

    return {
      formatted: expiration.toLocaleDateString("km-KH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      statusClass,
      statusText,
      diffDays,
      currentType,
    };
  };

  const handleDeleteNotification = async (id) => {
    if (!window.confirm("តើអ្នកពិតជាចង់លុបការជូនដំណឹងនេះមែនទេ?")) {
      return;
    }

    try {
      setDeleting(id);
      const response = await deleteNotification(id);
      if (response.success) {
        loadNotifications({ limit: 100 });
      } else {
        alert("មិនអាចលុបការជូនដំណឹងបានទេ");
      }
    } catch (error) {
      console.error("❌ Delete error:", error);
      alert("មិនអាចលុបការជូនដំណឹងបានទេ");
    } finally {
      setDeleting(null);
    }
  };

  const handleMarkAsRead = async (notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
  };

  const handleReset = () => {
    setFilter("all");
    setTypeFilter("all");
    setCurrentPage(1);
  };

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      if (filter === "unread" && notification.is_read) return false;
      if (filter === "read" && !notification.is_read) return false;

      const isExpirationNotification = [
        "expiring_soon",
        "expiring_today",
        "expired",
      ].includes(notification.type);

      if (isExpirationNotification) {
        const expirationInfo = getCurrentExpirationStatus(notification);
        if (!expirationInfo) return false;
        if (typeFilter !== "all" && typeFilter !== expirationInfo.currentType) {
          return false;
        }
      } else {
        if (typeFilter !== "all" && notification.type !== typeFilter)
          return false;
      }

      return true;
    });
  }, [notifications, filter, typeFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = notifications.length;
    const unread = notifications.filter((n) => !n.is_read).length;
    const read = notifications.filter((n) => n.is_read).length;
    const critical = notifications.filter(
      (n) =>
        n.type === "out_of_stock" ||
        n.type === "expired" ||
        n.type === "expiring_today",
    ).length;

    return {
      total,
      unread,
      read,
      critical,
    };
  }, [notifications]);

  // Pagination
  const totalItems = filteredNotifications.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedNotifications = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredNotifications.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredNotifications, currentPage]);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 bg-gradient-to-br from-rose-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <Bell className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">ការជូនដំណឹង</h1>
              <p className="text-gray-600 text-sm">
                គ្រប់គ្រងការជូនដំណឹងរបស់អ្នក
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-rose-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">សារសរុប</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
                <p className="text-xs text-gray-500 mt-1">ទាំងអស់</p>
              </div>
              <div className="h-12 w-12 bg-rose-100 rounded-lg flex items-center justify-center">
                <Bell className="h-6 w-6 text-rose-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">មិនទាន់អាន</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.unread}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {((stats.unread / stats.total) * 100 || 0).toFixed(1)}%
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BellRing className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">បានអាន</p>
                <p className="text-2xl font-bold text-gray-900">{stats.read}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {((stats.read / stats.total) * 100 || 0).toFixed(1)}%
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Archive className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">សំខាន់</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.critical}
                </p>
                <p className="text-xs text-gray-500 mt-1">ត្រូវចាប់អារម្មណ៍</p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="bg-white rounded-xl shadow-md p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">តម្រង</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ស្ថានភាព
              </label>
              <select
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
              >
                <option value="all">ទាំងអស់</option>
                <option value="unread">មិនទាន់អាន</option>
                <option value="read">បានអាន</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ប្រភេទ
              </label>
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
              >
                <option value="all">ប្រភេទទាំងអស់</option>
                <option value="low_stock">ស្តុកទាប</option>
                <option value="out_of_stock">អស់ស្តុក</option>
                <option value="sale_new">ការលក់ថ្មី</option>
                <option value="purchase_new">ការទិញថ្មី</option>
                <option value="expiring_soon">ជិតផុតកំណត់</option>
                <option value="expiring_today">ផុតកំណត់ថ្ងៃនេះ</option>
                <option value="expired">បានផុតកំណត់</option>
              </select>
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={handleReset}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-all"
              >
                <X className="h-5 w-5" />
                សម្អាត
              </button>
              <button
                onClick={() => loadNotifications({ limit: 100 })}
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-5 w-5 ${loading ? "animate-spin" : ""}`}
                />
                ផ្ទុកឡើងវិញ
              </button>
              {stats.unread > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex-1 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white px-4 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-all shadow-lg"
                >
                  <CheckCheck className="h-5 w-5" />
                  អានទាំងអស់
                </button>
              )}
            </div>
          </div>

          <div className="text-sm text-gray-600">
            បង្ហាញ{" "}
            <span className="font-semibold text-rose-600">
              {filteredNotifications.length}
            </span>{" "}
            ពី{" "}
            <span className="font-semibold text-rose-600">
              {notifications.length}
            </span>{" "}
            សារ
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg text-red-700 flex items-center gap-3">
            <AlertCircle className="h-5 w-5" />
            <div>
              <p className="font-semibold">មានបញ្ហាក្នុងការផ្ទុកការជូនដំណឹង</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Notifications List */}
        {loading && notifications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-rose-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600 font-medium">កំពុងផ្ទុក...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BellOff className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              គ្មានការជូនដំណឹង
            </h3>
            <p className="text-gray-600">
              {filter !== "all" || typeFilter !== "all"
                ? "សូមព្យាយាមផ្លាស់ប្តូរតម្រង"
                : "អ្នកមិនមានការជូនដំណឹងណាមួយនៅឡើយទេ"}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="divide-y divide-gray-100">
              {paginatedNotifications.map((notification, index) => {
                const expirationInfo = getCurrentExpirationStatus(notification);
                const isExpirationNotification = [
                  "expiring_soon",
                  "expiring_today",
                  "expired",
                ].includes(notification.type);
                const displayType =
                  isExpirationNotification && expirationInfo
                    ? expirationInfo.currentType
                    : notification.type;

                return (
                  <div
                    key={notification.id}
                    className={`p-5 hover:bg-rose-50 transition-colors ${
                      !notification.is_read
                        ? "bg-blue-50 border-l-4 border-l-blue-500"
                        : index % 2 === 0
                          ? "bg-white"
                          : "bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center shadow-sm border-2 border-gray-100">
                          {getNotificationIcon(displayType)}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-base font-semibold text-gray-900">
                                {notification.title}
                              </h4>
                              {!notification.is_read && (
                                <span className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {notification.message}
                            </p>

                            {expirationInfo && (
                              <div
                                className={`mb-3 inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${expirationInfo.statusClass}`}
                              >
                                <Calendar className="h-4 w-4" />
                                <div className="flex flex-col">
                                  <span className="text-xs font-bold">
                                    {expirationInfo.statusText}
                                  </span>
                                  <span className="text-xs opacity-90">
                                    ផុតកំណត់: {expirationInfo.formatted}
                                  </span>
                                </div>
                              </div>
                            )}

                            <div className="flex items-center flex-wrap gap-3">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                                {getTypeLabel(displayType)}
                              </span>
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatNotificationTime(
                                  notification.created_at,
                                )}
                              </span>
                              {notification.reference_id && (
                                <span className="text-xs text-gray-500 font-mono">
                                  ID: {notification.reference_id}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            {!notification.is_read && (
                              <button
                                onClick={() => handleMarkAsRead(notification)}
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all transform hover:scale-110"
                                title="សម្គាល់ថាបានអាន"
                              >
                                <Check className="h-5 w-5" />
                              </button>
                            )}
                            <button
                              onClick={() =>
                                handleDeleteNotification(notification.id)
                              }
                              disabled={deleting === notification.id}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all transform hover:scale-110 disabled:opacity-50"
                              title="លុប"
                            >
                              {deleting === notification.id ? (
                                <div className="h-5 w-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <Trash2 className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between border-t bg-gradient-to-r from-gray-50 to-gray-100 gap-3">
                <div className="text-sm text-gray-700 font-medium">
                  បង្ហាញ{" "}
                  <span className="font-bold text-rose-600">
                    {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                    {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}
                  </span>{" "}
                  នៃ{" "}
                  <span className="font-bold text-rose-600">{totalItems}</span>{" "}
                  សារ
                </div>

                <nav className="flex items-center gap-1 flex-wrap justify-center">
                  <button
                    onClick={() => goToPage(1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-rose-50 hover:border-rose-300 hover:text-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    « ដើម
                  </button>

                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-rose-50 hover:border-rose-300 hover:text-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
                            ? "bg-gradient-to-r from-rose-600 to-pink-600 text-white border-rose-600 shadow-lg"
                            : "border-gray-300 bg-white text-gray-700 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-600"
                        }`}
                      >
                        {p}
                      </button>
                    ),
                  )}

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-rose-50 hover:border-rose-300 hover:text-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    បន្ទាប់
                  </button>

                  <button
                    onClick={() => goToPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-rose-50 hover:border-rose-300 hover:text-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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

export default NotificationList;
