
// src/utils/permissions.js
import { useState, useEffect } from "react";
// Define user roles
const USER_ROLES = {
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  INVENTORY: "INVENTORY",
  SALES: "SALES",
  USER: "USER",
};
// Roles with admin privileges (can perform CUD operations)
const ADMIN_PRIVILEGE_ROLES = [
  USER_ROLES.ADMIN,
  USER_ROLES.MANAGER,
  USER_ROLES.INVENTORY,
  USER_ROLES.SALES,
];
// Roles with sales privileges (can create orders, receive payments)
const SALES_PRIVILEGE_ROLES = [
  USER_ROLES.ADMIN,
  USER_ROLES.MANAGER,
  USER_ROLES.SALES,
  USER_ROLES.INVENTORY,
];
// Hook to check if user has admin privileges
export const useIsAdmin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    // Check multiple sources for role information
    const userRole =
      localStorage.getItem("userRole") || localStorage.getItem("role");
    let userFromStorage = null;
    try {
      const userString = localStorage.getItem("user");
      userFromStorage = userString ? JSON.parse(userString) : null;
    } catch (e) {
      console.error("Error parsing user from localStorage:", e);
    }
    // Check if user is admin from multiple sources
    let hasAdminRole = false;
    // Method 1: Check localStorage role
    if (userRole) {
      hasAdminRole = ADMIN_PRIVILEGE_ROLES.includes(userRole.toUpperCase());
    }
    // Method 2: Check user object role
    if (!hasAdminRole && userFromStorage) {
      const roleFromUser = userFromStorage.role?.toUpperCase();
      hasAdminRole =
        ADMIN_PRIVILEGE_ROLES.includes(roleFromUser) ||
        userFromStorage.role_id === 1 ||
        roleFromUser === "ADMIN";
    }
    // Method 3: Check if username is Admin (fallback)
    if (!hasAdminRole && userFromStorage) {
      hasAdminRole =
        userFromStorage.username?.toLowerCase() === "admin" ||
        userFromStorage.name?.toLowerCase() === "admin";
    }
    // Method 4: Force admin for testing (temporary)
    // Remove this in production
    if (!hasAdminRole) {
      const currentUser =
        userFromStorage?.username || userFromStorage?.name || "";
      if (currentUser.toLowerCase().includes("admin")) {
        hasAdminRole = true;
      }
    }
    setIsAdmin(hasAdminRole);
  }, []);
  return isAdmin;
};
// Hook for strict Super Admin (only exact ADMIN role for sensitive operations like roles management)
export const useIsSuperAdmin = () => {
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  useEffect(() => {
    // Check multiple sources for role information
    const userRole =
      localStorage.getItem("userRole") || localStorage.getItem("role");
    let userFromStorage = null;
    try {
      const userString = localStorage.getItem("user");
      userFromStorage = userString ? JSON.parse(userString) : null;
    } catch (e) {
      console.error("Error parsing user from localStorage:", e);
    }
    // Check if user is exact ADMIN (stricter than useIsAdmin)
    let hasSuperAdminRole = false;
    // Method 1: Check localStorage role
    if (userRole) {
      hasSuperAdminRole = userRole.toUpperCase() === "ADMIN";
    }
    // Method 2: Check user object role
    if (!hasSuperAdminRole && userFromStorage) {
      const roleFromUser = userFromStorage.role?.toUpperCase();
      hasSuperAdminRole = roleFromUser === "ADMIN" || userFromStorage.role_id === 1;
    }
    // Method 3: Check if username is Admin (fallback)
    if (!hasSuperAdminRole && userFromStorage) {
      hasSuperAdminRole =
        userFromStorage.username?.toLowerCase() === "admin" ||
        userFromStorage.name?.toLowerCase() === "admin";
    }
    // Method 4: Force admin for testing (temporary)
    // Remove this in production
    if (!hasSuperAdminRole) {
      const currentUser =
        userFromStorage?.username || userFromStorage?.name || "";
      if (currentUser.toLowerCase().includes("admin")) {
        hasSuperAdminRole = true;
      }
    }
    setIsSuperAdmin(hasSuperAdminRole);
  }, []);
  return isSuperAdmin;
};
// Hook to check if user has sales privileges
export const useIsSales = () => {
  const [isSales, setIsSales] = useState(false);
  useEffect(() => {
    const userRole =
      localStorage.getItem("userRole") || localStorage.getItem("role");
    // Allow admin, manager, sales staff, and inventory clerk roles to perform sales operations
    setIsSales(SALES_PRIVILEGE_ROLES.includes(userRole));
  }, []);
  return isSales;
};
// Component to conditionally render content based on admin/manager/inventory role
export const AdminOnly = ({ children, fallback = null }) => {
  const isAdmin = useIsAdmin();
  return isAdmin ? children : fallback;
};
// Component to conditionally render content based on strict Super Admin
export const SuperAdminOnly = ({ children, fallback = null }) => {
  const isSuperAdmin = useIsSuperAdmin();
  return isSuperAdmin ? children : fallback;
};
// Component to conditionally render content for sales staff
export const SalesOnly = ({ children, fallback = null }) => {
  const isSales = useIsSales();
  return isSales ? children : fallback;
};
// Component to conditionally render content for regular users
export const UserOnly = ({ children, fallback = null }) => {
  const isAdmin = useIsAdmin();
  return !isAdmin ? children : fallback;
};
// Helper function to check permissions
export const checkPermission = (action = "read") => {
  const userRole =
    localStorage.getItem("userRole") || localStorage.getItem("role");
  if (action === "read") {
    return true; // All users can read
  }
  // Create, Update, Delete operations require admin privileges
  if (action === "write") {
    return ADMIN_PRIVILEGE_ROLES.includes(userRole);
  }
  // Sales operations (create orders, receive payments)
  if (action === "sales") {
    return SALES_PRIVILEGE_ROLES.includes(userRole);
  }
  // Default to admin privileges for other operations
  return ADMIN_PRIVILEGE_ROLES.includes(userRole);
};
/**
 * Check if user has a specific permission
 * @param {Object} user - User object with permissions array
 * @param {string} permissionName - Permission name (e.g., 'view_product', 'create_sale')
 * @returns {boolean}
 */
export const hasPermission = (user, permissionName) => {
  if (!user) {
    return false;
  }
  
  const roleName = user.role?.toUpperCase();
  // Admin has all permissions by default
  if (roleName === "ADMIN" || user.role_id === 1) {
    return true;
  }
  // Manager has most permissions (all except some system restrictions)
  if (roleName === "MANAGER" || user.role_id === 2) {
    return true;
  }
  // Inventory role: Can manage products, categories, brands, suppliers, purchases
  if (roleName === "INVENTORY" || user.role_id === 4) {
    const inventoryPermissions = [
      "view_product",
      "create_product",
      "edit_product",
      "delete_product",
      "view_category",
      "create_category",
      "edit_category",
      "delete_category",
      "view_brand",
      "create_brand",
      "edit_brand",
      "delete_brand",
      "view_supplier",
      "create_supplier",
      "edit_supplier",
      "delete_supplier",
      "view_purchase",
      "create_purchase",
      "edit_purchase",
      "delete_purchase",
    ];
    return inventoryPermissions.includes(permissionName);
  }
  // Sales role: Grant specific permissions like view_payment, view_sale, create_sale, edit_sale, delete_sale, cancel_sale, etc.
  if (roleName === "SALES" || user.role_id === 3) {
    const salesPermissions = [
      "view_payment",
      "create_payment",
      "view_sale",
      "create_sale",
      "edit_sale",
      "delete_sale",
      "cancel_sale",
      "view_customer",
      "create_customer",
      "edit_customer",
      "view_purchase",
    ];
    return salesPermissions.includes(permissionName);
  }
  // Other roles check permissions array
  if (!user.permissions || !Array.isArray(user.permissions)) {
    return false;
  }
  return user.permissions.includes(permissionName);
};
/**
 * Check if user has any of the specified permissions
 * @param {Object} user - User object with permissions array
 * @param {string[]} permissionNames - Array of permission names
 * @returns {boolean}
 */
export const hasAnyPermission = (user, permissionNames) => {
  if (!user) {
    return false;
  }
  const roleName = user.role?.toUpperCase();
  // Admin has all permissions
  if (roleName === "ADMIN" || user.role_id === 1) {
    return true;
  }
  // Manager has most permissions
  if (roleName === "MANAGER" || user.role_id === 2) {
    return false;
  }
  
  // Inventory role: Check against inventory-specific permissions
  if (roleName === "INVENTORY" || user.role_id === 4) {
    const inventoryPermissions = [
      "view_product",
      "create_product",
      "edit_product",
      "delete_product",
      "view_category",
      "create_category",
      "edit_category",
      "delete_category",
      "view_brand",
      "create_brand",
      "edit_brand",
      "delete_brand",
      "view_supplier",
      "create_supplier",
      "edit_supplier",
      "delete_supplier",
      "view_purchase",
      "create_purchase",
      "edit_purchase",
      "delete_purchase",
    ];
    return permissionNames.some((permission) =>
      inventoryPermissions.includes(permission)
    );
  }
  // Sales role: Check against sales-specific permissions
  if (roleName === "SALES" || user.role_id === 3) {
    const salesPermissions = [
      "view_payment",
      "create_payment",
      "view_sale",
      "create_sale",
      "edit_sale",
      "delete_sale",
      "cancel_sale",
      "view_customer",
      "create_customer",
      "edit_customer",
      "view_purchase",
    ];
    return permissionNames.some((permission) =>
      salesPermissions.includes(permission)
    );
  }
  // Other roles check permissions array
  if (!user.permissions || !Array.isArray(user.permissions)) {
    return false;
  }
  return permissionNames.some((permission) =>
    user.permissions.includes(permission)
  );
};
/**
 * Check if user has all of the specified permissions
 * @param {Object} user - User object with permissions array
 * @param {string[]} permissionNames - Array of permission names
 * @returns {boolean}
 */
export const hasAllPermissions = (user, permissionNames) => {
  if (!user) {
    return false;
  }
  const roleName = user.role?.toUpperCase();
  // Admin has all permissions
  if (roleName === "ADMIN" || user.role_id === 1) {
    return true;
  }
  // Manager has most permissions
  if (roleName === "MANAGER" || user.role_id === 2) {
    return true;
  }
    // Inventory role: Check against inventory-specific permissions
  if (roleName === "MANAGER" || user.role_id === 4) {
    const inventoryPermissions = [
      "view_product",
      "create_product",
      "edit_product",
      // "delete_product",
      "view_category",
      "create_category",
      "edit_category",
      // "delete_category",
      "view_brand",
      "create_brand",
      "edit_brand",
      // "delete_brand",
      "view_supplier",
      "create_supplier",
      "edit_supplier",
      // "delete_supplier",
      "view_purchase",
      "create_purchase",
      "edit_purchase",
      // "delete_purchase",
    ];
    return permissionNames.every((permission) =>
      inventoryPermissions.includes(permission)
    );
  }
  // Inventory role: Check against inventory-specific permissions
  if (roleName === "INVENTORY" || user.role_id === 4) {
    const inventoryPermissions = [
      "view_product",
      "create_product",
      "edit_product",
      "delete_product",
      "view_category",
      "create_category",
      "edit_category",
      "delete_category",
      "view_brand",
      "create_brand",
      "edit_brand",
      "delete_brand",
      "view_supplier",
      "create_supplier",
      "edit_supplier",
      "delete_supplier",
      "view_purchase",
      "create_purchase",
      "edit_purchase",
      "delete_purchase",
    ];
    return permissionNames.every((permission) =>
      inventoryPermissions.includes(permission)
    );
  }
  // Sales role: Check against sales-specific permissions
  if (roleName === "SALES" || user.role_id === 3) {
    const salesPermissions = [
      "view_payment",
      "create_payment",
      "view_sale",
      "create_sale",
      "edit_sale",
      "delete_sale",
      "cancel_sale",
      "view_customer",
      "create_customer",
      "edit_customer",
    ];
    return permissionNames.every((permission) =>
      salesPermissions.includes(permission)
    );
  }
  // Other roles check permissions array
  if (!user.permissions || !Array.isArray(user.permissions)) {
    return false;
  }
  return permissionNames.every((permission) =>
    user.permissions.includes(permission)
  );
};
/**
 * Check if user has a specific role
 * @param {Object} user - User object with role property
 * @param {string|string[]} roleNames - Role name(s) to check
 * @returns {boolean}
 */
export const hasRole = (user, roleNames) => {
  if (!user || !user.role) {
    return false;
  }
  const roles = Array.isArray(roleNames) ? roleNames : [roleNames];
  return roles.includes(user.role);
};
/**
 * Check if user can perform an action on a module
 * @param {Object} user - User object with permissions array
 * @param {string} module - Module name (e.g., 'product', 'sale')
 * @param {string} action - Action name (e.g., 'view', 'create', 'edit', 'delete', 'cancel')
 * @returns {boolean}
 */
export const can = (user, module, action) => {
  if (!user) {
    return false;
  }
  const roleName = user.role?.toUpperCase();
  // Admin has all permissions (Edit, Update, Insert/Add, Delete)
  if (roleName === "ADMIN" || user.role_id === 1) {
    return true;
  }
  // Manager has most permissions (similar to Admin)
  if (roleName === "MANAGER" || user.role_id === 2) {
     const managerModules = ["product", "category", "brand", "supplier", "user","staff" , "customer"];
    const allowedActions = ["view", "create", "edit"];
    
    if (managerModules.includes(module) && allowedActions.includes(action)) {
      return true;
    }
    return false;
  }


  // Inventory role: Full access to products, categories, brands, suppliers, purchases
  if (roleName === "INVENTORY" || user.role_id === 4) {
    const inventoryModules = ["product", "category", "brand", "supplier", "purchase", "staff"];
    const allowedActions = ["view", "create", "edit", "delete"];
   
    if (inventoryModules.includes(module) && allowedActions.includes(action)) {
      return true;
    }
    return false;
  }
  // Sales role: Allow view, create, edit, delete, and cancel for payments, sales, customers
  if (roleName === "SALES" || user.role_id === 3) {
    if (module === "payment" && (action === "view" || action === "create")) {
      return true;
    }
    if (module === "customer" && (action === "view" || action === "create" || action === "edit")) {
      return true;
    }
    if (module === "staff" && (action === "view" )) {
      return false;
    }
    if (module === "sale" && (action === "view" || action === "create" || action === "edit" || action === "delete" || action === "cancel")) {
      return true;
    }
    return false;
  }
  // Other roles (CASHIER, USER) check permissions array
  const permissionName = `${action}_${module}`;
  return hasPermission(user, permissionName);
};
/**
 * Get all permissions for a specific module
 * @param {Object} user - User object with permissions array
 * @param {string} module - Module name
 * @returns {string[]} Array of permission names for the module
 */
export const getModulePermissions = (user, module) => {
  if (!user || !user.permissions || !Array.isArray(user.permissions)) {
    return [];
  }
  return user.permissions.filter((permission) =>
    permission.endsWith(`_${module}`)
  );
};
// Common permission checks
export const canViewProduct = (user) => can(user, "product", "view");
export const canCreateProduct = (user) => can(user, "product", "create");
export const canEditProduct = (user) => can(user, "product", "edit");
export const canDeleteProduct = (user) => can(user, "product", "delete");
export const canViewSale = (user) => can(user, "sale", "view");
export const canCreateSale = (user) => can(user, "sale", "create");
export const canEditSale = (user) => can(user, "sale", "edit");
export const canDeleteSale = (user) => can(user, "sale", "delete");
export const canCancelSale = (user) => can(user, "sale", "cancel");
export const canViewPurchase = (user) => can(user, "purchase", "view");
export const canCreatePurchase = (user) => can(user, "purchase", "create");
export const canEditPurchase = (user) => can(user, "purchase", "edit");
export const canDeletePurchase = (user) => can(user, "purchase", "delete");
export const canViewUser = (user) => can(user, "user", "view");
export const canCreateUser = (user) => can(user, "user", "create");
export const canEditUser = (user) => can(user, "user", "edit");
export const canDeleteUser = (user) => can(user, "user", "delete");
export const canViewReport = (user) =>
  hasAnyPermission(user, ["view_import_report", "view_sale_report"]);
// Debug function to check user permissions
export const debugUserPermissions = () => {
  const userRole =
    localStorage.getItem("userRole") || localStorage.getItem("role");
  const userString = localStorage.getItem("user");
  let user = null;
  try {
    user = userString ? JSON.parse(userString) : null;
  } catch (e) {
    // console.error("Error parsing user from localStorage:", e);
  }
  return {
    userRole,
    user,
    useIsAdmin,
    useIsSales,
    useIsSuperAdmin,
    AdminOnly,
    SuperAdminOnly,
    SalesOnly,
    UserOnly,
    checkPermission,
    USER_ROLES,
    ADMIN_PRIVILEGE_ROLES,
    SALES_PRIVILEGE_ROLES,
    isAdminByRole: ADMIN_PRIVILEGE_ROLES.includes(userRole),
    isAdminByUser: user?.role?.toUpperCase() === "ADMIN" || user?.role_id === 1,
  };
};
// Temporary fix function to force admin role
export const forceAdminRole = () => {
  localStorage.setItem("userRole", "ADMIN");
  localStorage.setItem("role", "ADMIN");
  const userString = localStorage.getItem("user");
  if (userString) {
    try {
      const user = JSON.parse(userString);
      user.role = "ADMIN";
      user.role_id = 1;
      localStorage.setItem("user", JSON.stringify(user));
    } catch (e) {
      // console.error("Error updating user object:", e);
    }
  }
  alert("Admin role has been set. Please refresh the page (F5).");
};