// // src/components/notifications/NotificationDropdown.jsx
// import React, { useState, useRef, useEffect } from "react";
// import {
//   Bell,
//   X,
//   CheckCheck,
//   AlertCircle,
//   Package,
//   ShoppingCart,
//   TrendingUp,
//   Calendar,
// } from "lucide-react";
// import { useNotifications } from "../../context/NotificationContext";
// import { formatDistanceToNow } from "../../utils/dateUtils";
// import { useNavigate } from "react-router-dom";

// const NotificationDropdown = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const dropdownRef = useRef(null);
//   const navigate = useNavigate();
//   const {
//     notifications,
//     unreadCount,
//     loading,
//     markAsRead,
//     markAllAsRead,
//     loadNotifications,
//   } = useNotifications();

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setIsOpen(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   useEffect(() => {
//     if (isOpen) {
//       loadNotifications({ limit: 10 });
//     }
//   }, [isOpen]);

//   const handleNotificationClick = async (notification) => {
//     if (!notification.is_read) {
//       await markAsRead(notification.id);
//     }
//     setIsOpen(false);
//   };

//   const handleMarkAllAsRead = async () => {
//     await markAllAsRead();
//   };

//   const handleViewAll = () => {
//     setIsOpen(false);
//     navigate("/notifications");
//   };

//   const getNotificationIcon = (type) => {
//     switch (type) {
//       case "low_stock":
//         return <AlertCircle className="h-4 w-4 text-yellow-500" />;
//       case "out_of_stock":
//         return <Package className="h-4 w-4 text-red-500" />;
//       case "sale_new":
//         return <ShoppingCart className="h-4 w-4 text-green-500" />;
//       case "purchase_new":
//         return <TrendingUp className="h-4 w-4 text-blue-500" />;
//       case "expiring_soon":
//         return <Calendar className="h-4 w-4 text-orange-500" />;
//       case "expiring_today":
//         return <Calendar className="h-4 w-4 text-red-600" />;
//       case "expired":
//         return <Calendar className="h-4 w-4 text-red-700" />;
//       default:
//         return <Bell className="h-4 w-4 text-gray-500 " />;
//     }
//   };

//   const formatNotificationTime = (createdAt) => {
//     try {
//       return formatDistanceToNow(new Date(createdAt), { addSuffix: true });
//     } catch (error) {
//       return "ថ្មីៗនេះ";
//     }
//   };

//   // ✅ FIXED: Get expiration info from notification.data.expire_date first
//   const getExpirationInfo = (notification) => {
//     // Check data.expire_date first, then fallback to Product.expire_date
//     const expireDate =
//       notification.data?.expire_date || notification.Product?.expire_date;

//     if (!expireDate) return null;

//     const expiration = new Date(expireDate);
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     expiration.setHours(0, 0, 0, 0);

//     const diffTime = expiration - today;
//     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

//     // ✅ Don't show if more than 7 days
//     if (diffDays > 7) return null;

//     let statusClass = "";
//     let statusText = "";

//     if (diffDays < 0) {
//       statusClass = "bg-red-100 text-red-800";
//       statusText = "ផុតកំណត់";
//     } else if (diffDays === 0) {
//       statusClass = "bg-orange-100 text-orange-800";
//       statusText = "ផុតថ្ងៃនេះ";
//     } else if (diffDays <= 3) {
//       statusClass = "bg-yellow-100 text-yellow-800";
//       statusText = `${diffDays} ថ្ងៃ`;
//     } else if (diffDays <= 7) {
//       statusClass = "bg-blue-100 text-blue-800";
//       statusText = `${diffDays} ថ្ងៃ`;
//     }

//     return {
//       formatted: expiration.toLocaleDateString("km-KH"),
//       statusClass,
//       statusText,
//       diffDays,
//     };
//   };

//   // ✅ Filter notifications: Only show expiration notifications when <= 7 days
//   const getFilteredNotifications = () => {
//     return notifications
//       .filter((notification) => {
//         // For expiration-related notifications
//         if (
//           ["expiring_soon", "expiring_today", "expired"].includes(
//             notification.type,
//           )
//         ) {
//           const expirationInfo = getExpirationInfo(notification);
//           // ✅ Only show if we have expiration info (means <= 7 days)
//           return expirationInfo !== null;
//         }

//         // Show all other notification types
//         return true;
//       })
//       .slice(0, 10);
//   };

//   const filteredNotifications = getFilteredNotifications();

//   return (
//     <div className="relative" ref={dropdownRef}>
//       {/* Notification Bell Button */}
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className="relative p-2 text-black hover:bg-white/20 rounded-lg transition-colors"
//       >
//         <Bell className="h-5 w-5 " />
//         {unreadCount > 0 && (
//           <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
//             {unreadCount > 20 ? "20+" : unreadCount}
//           </span>
//         )}
//       </button>

//       {/* Dropdown Menu */}
//       {isOpen && (
//         <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
//           {/* Header */}
//           <div className="flex items-center justify-between p-4 border-b border-gray-200">
//             <h3 className="text-lg font-semibold text-gray-800">ការជូនដំណឹង</h3>
//             <div className="flex items-center gap-2">
//               {unreadCount > 0 && (
//                 <button
//                   onClick={handleMarkAllAsRead}
//                   className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
//                   title="Mark all as read"
//                 >
//                   <CheckCheck className="h-4 w-4" />
//                   <span className="hidden sm:inline">បានអានទាំងអស់</span>
//                 </button>
//               )}
//               <button
//                 onClick={() => setIsOpen(false)}
//                 className="text-gray-400 hover:text-gray-600"
//               >
//                 <X className="h-4 w-4" />
//               </button>
//             </div>
//           </div>

//           {/* Notifications List */}
//           <div className="max-h-96 overflow-y-auto">
//             {loading ? (
//               <div className="p-4 text-center">
//                 <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
//                 <p className="mt-2 text-sm text-gray-500">កំពុងផ្ទុក...</p>
//               </div>
//             ) : filteredNotifications.length === 0 ? (
//               <div className="p-8 text-center">
//                 <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
//                 <p className="text-gray-500">គ្មានការជូនដំណឹង</p>
//                 <p className="text-gray-400 text-xs mt-1">
//                   អ្នកមិនមានសារថ្មីណាមួយទេ
//                 </p>
//               </div>
//             ) : (
//               <div className="divide-y divide-gray-100">
//                 {filteredNotifications.map((notification) => {
//                   const expirationInfo = getExpirationInfo(notification);

//                   return (
//                     <div
//                       key={notification.id}
//                       onClick={() => handleNotificationClick(notification)}
//                       className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
//                         !notification.is_read
//                           ? "bg-blue-50 border-l-4 border-l-blue-500"
//                           : ""
//                       }`}
//                     >
//                       <div className="flex items-start gap-3">
//                         <div className="flex-shrink-0 mt-1">
//                           {getNotificationIcon(notification.type)}
//                         </div>
//                         <div className="flex-1 min-w-0">
//                           <div className="flex items-center justify-between">
//                             <h4 className="text-sm font-medium text-gray-900 truncate">
//                               {notification.title}
//                             </h4>
//                             {!notification.is_read && (
//                               <div className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0 ml-2"></div>
//                             )}
//                           </div>
//                           <p className="text-sm text-gray-600 mt-1 line-clamp-2">
//                             {notification.message}
//                           </p>

//                           {/* ✅ Only shows when <= 7 days */}
//                           {expirationInfo && (
//                             <div
//                               className={`mt-2 inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${expirationInfo.statusClass}`}
//                             >
//                               <Calendar className="h-3 w-3" />
//                               <span>{expirationInfo.statusText}</span>
//                             </div>
//                           )}

//                           <p className="text-xs text-gray-400 mt-2">
//                             {formatNotificationTime(notification.created_at)}
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//           </div>

//           {/* Footer */}
//           {filteredNotifications.length > 0 && (
//             <div className="p-3 border-t border-gray-200 bg-gray-50">
//               <button
//                 onClick={handleViewAll}
//                 className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
//               >
//                 មើលការជូនដំណឹងទាំងអស់
//               </button>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default NotificationDropdown;

// src/components/notifications/NotificationDropdown.jsx
import React, { useState, useRef, useEffect } from "react";
import {
  Bell,
  X,
  CheckCheck,
  AlertCircle,
  Package,
  ShoppingCart,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { useNotifications } from "../../context/NotificationContext";
import { formatDistanceToNow } from "../../utils/dateUtils";
import { useNavigate } from "react-router-dom";

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    loadNotifications,
  } = useNotifications();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadNotifications({ limit: 10 });
    }
  }, [isOpen]);

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    setIsOpen(false);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleViewAll = () => {
    setIsOpen(false);
    navigate("/notifications");
  };

  const getNotificationIcon = (type) => {
    const iconConfig = {
      low_stock: { Icon: AlertCircle, color: "text-yellow-600" },
      out_of_stock: { Icon: Package, color: "text-red-600" },
      sale_new: { Icon: ShoppingCart, color: "text-emerald-600" },
      purchase_new: { Icon: TrendingUp, color: "text-blue-600" },
      expiring_soon: { Icon: Calendar, color: "text-orange-600" },
      expiring_today: { Icon: Calendar, color: "text-red-600" },
      expired: { Icon: Calendar, color: "text-rose-600" },
      default: { Icon: Bell, color: "text-gray-600" },
    };

    const config = iconConfig[type] || iconConfig.default;
    const { Icon, color } = config;

    return <Icon className={`h-3.5 w-3.5 ${color}`} />;
  };

  const formatNotificationTime = (createdAt) => {
    try {
      return formatDistanceToNow(new Date(createdAt), { addSuffix: true });
    } catch (error) {
      return "Just now";
    }
  };

  const getExpirationInfo = (notification) => {
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

    if (diffDays < 0) {
      statusClass = "bg-red-100 text-red-700";
      statusText = "Expired";
    } else if (diffDays === 0) {
      statusClass = "bg-orange-100 text-orange-700";
      statusText = "Today";
    } else if (diffDays <= 3) {
      statusClass = "bg-yellow-100 text-yellow-700";
      statusText = `${diffDays}d`;
    } else if (diffDays <= 7) {
      statusClass = "bg-blue-100 text-blue-700";
      statusText = `${diffDays}d`;
    }

    return { statusClass, statusText };
  };

  const getFilteredNotifications = () => {
    return notifications
      .filter((notification) => {
        if (
          ["expiring_soon", "expiring_today", "expired"].includes(
            notification.type,
          )
        ) {
          const expirationInfo = getExpirationInfo(notification);
          return expirationInfo !== null;
        }
        return true;
      })
      .slice(0, 10);
  };

  const filteredNotifications = getFilteredNotifications();

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
            <div>
              <h3 className="text-xs font-bold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <p className="text-[10px] text-gray-500">
                  {unreadCount} unread
                </p>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-blue-600 hover:text-blue-700 p-1 rounded hover:bg-blue-50 transition"
                  title="Mark all as read"
                >
                  <CheckCheck className="h-3 w-3" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition"
                aria-label="Close"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="p-6 text-center">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
                <p className="mt-2 text-[10px] text-gray-600">Loading...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-6 text-center">
                <div className="mx-auto h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                  <Bell className="h-5 w-5 text-gray-400" />
                </div>
                <p className="text-xs font-semibold text-gray-900">
                  No Notifications
                </p>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  All caught up!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredNotifications.map((notification) => {
                  const expirationInfo = getExpirationInfo(notification);

                  return (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`px-2.5 py-2 hover:bg-gray-50 cursor-pointer transition ${
                        !notification.is_read ? "bg-blue-50/50" : ""
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {/* Icon */}
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1.5">
                            <h4 className="text-[11px] font-bold text-gray-900 leading-tight line-clamp-1">
                              {notification.title}
                            </h4>
                            {!notification.is_read && (
                              <div className="h-1.5 w-1.5 bg-blue-500 rounded-full flex-shrink-0 mt-0.5"></div>
                            )}
                          </div>

                          <p className="text-[11px] text-gray-600 mt-0.5 line-clamp-2 leading-snug">
                            {notification.message}
                          </p>

                          {/* Expiry Badge */}
                          {expirationInfo && (
                            <div className="mt-1">
                              <span
                                className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold ${expirationInfo.statusClass}`}
                              >
                                <Calendar className="h-2 w-2" />
                                {expirationInfo.statusText}
                              </span>
                            </div>
                          )}

                          <p className="text-[9px] text-gray-400 mt-1 font-medium">
                            {formatNotificationTime(notification.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {filteredNotifications.length > 0 && (
            <div className="px-2.5 py-2 border-t border-gray-200 bg-gray-50">
              <button
                onClick={handleViewAll}
                className="w-full text-center text-[11px] text-blue-600 hover:text-blue-700 font-bold py-1.5 rounded-lg hover:bg-blue-50 transition"
              >
                View All Notifications
              </button>
            </div>
          )}
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  );
};

export default NotificationDropdown;
