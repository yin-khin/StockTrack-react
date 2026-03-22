import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  X,
  LayoutDashboard,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
  User,
  Shield,
  Settings,
  BarChart3,
  Tag,
  Award,
  ChevronDown,
  Store,
  IdCard,
  Bell,
  Ambulance,
  LogOut,
  Link,
} from "lucide-react";
import { AdminOnly } from "../../utils/permissions";
import { useNotifications } from "../../context/NotificationContext";
import { useAuth } from "../../context/AuthContext";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navigate = useNavigate();
  const [openMenus, setOpenMenus] = useState({
    inventory: false,
    operation: false,
    reports: false,
  });
  const location = useLocation();

  const notificationContext = useNotifications();
  const unreadCount = notificationContext?.unreadCount || 0;

  const toggleSidebar = () => setIsOpen((v) => !v);
  const closeSidebar = () => setIsOpen(false);

  const toggleMenu = (menuKey) => {
    setOpenMenus((prev) => ({ ...prev, [menuKey]: !prev[menuKey] }));
  };

  // Auto-expand active menu
  useEffect(() => {
    if (
      location.pathname.startsWith("/products") ||
      location.pathname.startsWith("/categories") ||
      location.pathname.startsWith("/brands")
    ) {
      setOpenMenus((prev) => ({ ...prev, inventory: true }));
    }

    if (
      location.pathname.startsWith("/purchases") ||
      location.pathname.startsWith("/sales") ||
      location.pathname.startsWith("/payments") ||
      location.pathname.startsWith("/suppliers")
    ) {
      setOpenMenus((prev) => ({ ...prev, operation: true }));
    }

    if (location.pathname.startsWith("/reports")) {
      setOpenMenus((prev) => ({ ...prev, reports: true }));
    }
  }, [location.pathname]);

  const menuItems = useMemo(
    () => [
      {
        path: "/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
      },
      {
        type: "dropdown",
        key: "inventory",
        label: "Inventory",
        icon: Package,
        children: [
          { path: "/products", label: "Products", icon: Package },
          { path: "/categories", label: "Categories", icon: Tag },
          { path: "/brands", label: "Brands", icon: Award },
        ],
      },
      {
        path: "/customers",
        label: "Customers",
        icon: Users,
      },
      { path: "/suppliers", label: "Suppliers", icon: Ambulance },
      {
        path: "/purchases",
        label: "Purchases",
        icon: Store,
        adminOnly: true,
      },
      {
        type: "dropdown",
        key: "operation",
        label: "Operation",
        icon: TrendingUp,
        adminOnly: true,
        children: [
          // { path: "/suppliers", label: "Suppliers", icon: Store },
          // {
          //   path: "/purchases",
          //   label: "Purchases",
          //   icon: TrendingUp,
          //   adminOnly: true,
          // },
          {
            path: "/sales",
            label: "Sales",
            icon: ShoppingCart,
            adminOnly: true,
          },
          {
            path: "/payments",
            label: "Payments",
            icon: IdCard,
            adminOnly: true,
          },
        ],
      },
      {
        type: "dropdown",
        key: "reports",
        label: "Reports",
        icon: BarChart3,
        adminOnly: true,
        children: [
          { path: "/reports/sales", label: "Sales", icon: ShoppingCart },
          {
            path: "/reports/imports",
            label: "Imports",
            icon: TrendingUp,
            adminOnly: true,
          },
          {
            path: "/reports/profit",
            label: "Profit",
            icon: BarChart3,
            adminOnly: true,
          },
        ],
      },
      {
        type: "divider",
      },
      {
        path: "/staff",
        label: "Staff",
        icon: Users,
        adminOnly: true,
      },
      {
        path: "/roles",
        label: "Roles",
        icon: Shield,
        adminOnly: true,
      },
      {
        path: "/users",
        label: "Users",
        icon: User,
        adminOnly: true,
      },
      {
        type: "divider",
      },
      {
        path: "/notifications",
        label: "Notifications",
        icon: Bell,
        badge: unreadCount > 0 ? unreadCount : null,
      },
      {
        path: "/settings",
        label: "Settings",
        icon: Settings,
      },
    ],
    [openMenus, unreadCount],
  );

  //Logout
  const { logout } = useAuth();
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-[4.5rem] left-4 z-40 p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg transition"
        aria-label="Toggle sidebar"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm lg:hidden z-30"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static top-0 left-0 h-screen w-64 z-40
          bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          flex flex-col
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Header */}
        <div className="h-14 px-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <h2 className="text-sm font-bold text-gray-900">Navigation</h2>
          <button
            onClick={closeSidebar}
            className="lg:hidden text-gray-500 hover:text-gray-700 p-1 rounded-md hover:bg-gray-100 transition"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-3">
          <ul className="space-y-1">
            {menuItems.map((item, index) => {
              // Divider
              if (item.type === "divider") {
                return (
                  <li
                    key={`divider-${index}`}
                    className="my-3 border-t text-lg  border-gray-200"
                  />
                );
              }

              const renderMenuItem = () => {
                // Dropdown Menu
                if (item.type === "dropdown") {
                  const isOpen = openMenus[item.key];
                  const hasActiveChild = item.children?.some(
                    (child) =>
                      location.pathname === child.path ||
                      location.pathname.startsWith(child.path + "/"),
                  );

                  const Icon = item.icon;

                  return (
                    <li key={item.key}>
                      <button
                        onClick={() => toggleMenu(item.key)}
                        className={`
                          w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all
                          ${
                            hasActiveChild
                              ? "bg-blue-50 text-blue-700"
                              : "text-gray-700 hover:bg-gray-50"
                          }
                        `}
                      >
                        <div
                          className="flex items-center gap-2.5"
                          style={{
                            fontFamily: "'Kantumruy Pro', sans-serif",
                            fontSize: "18px",
                          }}
                        >
                          <Icon
                            className={`h-5 w-5 ${hasActiveChild ? "text-blue-600" : "text-gray-400"}`}
                          />
                          <span
                            className="text-sm font-medium"
                            style={{ fontSize: "15px" }}
                          >
                            {item.label}
                          </span>
                        </div>
                        <ChevronDown
                          className={`h-4 w-4 text-gray-400 transition-transform ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {/* Submenu */}
                      {isOpen && item.children && (
                        <ul className="mt-1 ml-3 space-y-0.5 border-l-2 border-gray-100 pl-3">
                          {item.children.map((child) => {
                            const isActive =
                              location.pathname === child.path ||
                              location.pathname.startsWith(child.path + "/");
                            const ChildIcon = child.icon;

                            const childLink = (
                              <li key={child.path}>
                                <NavLink
                                  to={child.path}
                                  onClick={closeSidebar}
                                  className={`
                                    flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all
                                    ${
                                      isActive
                                        ? "bg-blue-50 text-blue-700 font-medium"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    }
                                  `}
                                >
                                  <ChildIcon
                                    className={`h-4 w-4 ${isActive ? "text-blue-600" : "text-gray-400"}`}
                                    style={{ fontSize: "15px" }}
                                  />
                                  {child.label}
                                </NavLink>
                              </li>
                            );

                            return child.adminOnly ? (
                              <AdminOnly key={child.path}>
                                {childLink}
                              </AdminOnly>
                            ) : (
                              childLink
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                }

                // Regular Link
                const isActive =
                  location.pathname === item.path ||
                  location.pathname.startsWith(item.path + "/");
                const Icon = item.icon;

                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      onClick={closeSidebar}
                      className={`
                        flex items-center justify-between px-3 py-2 rounded-lg transition-all
                        ${
                          isActive
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm"
                            : "text-gray-700 hover:bg-gray-50"
                        }
                      `}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`h-5 w-5 ${isActive ? "text-white" : "text-gray-400"}`}
                        />
                        <span
                          className="text-sm font-medium"
                          style={{ fontSize: "15px" }}
                        >
                          {item.label}
                        </span>
                      </div>

                      {/* Badge */}
                      {item.badge && (
                        <span
                          className={`
                            inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold rounded-full
                            ${isActive ? "bg-white text-blue-600" : "bg-red-500 text-white"}
                          `}
                        >
                          {item.badge > 20 ? "20+" : item.badge}
                        </span>
                      )}
                    </NavLink>
                  </li>
                );
              };

              return item.adminOnly ? (
                <AdminOnly key={item.path || item.key}>
                  {renderMenuItem()}
                </AdminOnly>
              ) : (
                renderMenuItem()
              );
            })}
          </ul>
          <br />
          <div className="flex-shrink-0 p-3 border-t border-gray-200">
            <div
              onClick={handleLogout}
              className="rounded-lg px-3 py-2 text-red-500
                   flex items-center gap-2 cursor-pointer hover:bg-indigo-100"
            >
              <LogOut size={18} />
              <span className="text-sm font-medium">Logout</span>
            </div>
          </div>
        </nav>
        {/* Footer */}
      </aside>
    </>
  );
};

export default Sidebar;
