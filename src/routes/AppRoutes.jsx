// src/routes/AppRoutes.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "../components/layout/ProtectedRoute";

// Auth Pages
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";

// Main Pages
import Dashboard from "../pages/dashboard/Dashboard";
import ProductList from "../pages/products/ProductList";
import ProductForm from "../pages/products/ProductForm";
import CategoryList from "../pages/categories/CategoryList";
import BrandList from "../pages/brands/BrandList";
import ImportList from "../pages/purchases/ImportList";
import ImportForm from "../pages/purchases/ImportForm";
import SaleList from "../pages/sales/SaleList";
import SaleForm from "../pages/sales/SaleForm";
import SaleDetail from "../pages/sales/SaleDetail";
import SupplierList from "../pages/suppliers/SupplierList";
import SupplierForm from "../pages/suppliers/SupplierForm";
import CustomerList from "../pages/customers/CustomerList";
import CustomerForm from "../pages/customers/CustomerForm";
import PaymentList from "../pages/payments/PaymentList";
import PaymentForm from "../pages/payments/PaymentForm";

// User Management Pages
import UserList from "../pages/users/UserList";
import UserForm from "../pages/users/UserForm";
import StaffList from "../pages/staff/StaffList";

// Role Management Pages
import RoleList from "../pages/roles/RoleList";
import RoleForm from "../pages/roles/RoleForm";

// Notification Pages
import NotificationList from "../pages/notifications/NotificationList";

// Settings Page
import Settings from "../pages/settings/Settings";

// Report Pages
import SaleReport from "../pages/reports/SaleReport";
import ImportReport from "../pages/reports/ImportReport";
import ProfitReport from "../pages/reports/ProfitReport";

// Error Pages
import NotFound from "../pages/errors/NotFound";
import Forbidden from "../pages/errors/Forbidden";

// Setup Page
import SystemSetup from "../pages/setup/SystemSetup";

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />
        }
      />
      <Route
        path="/forgot-password"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <ForgotPassword />
          )
        }
      />
      <Route path="/setup" element={<SystemSetup />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <ProductList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/products/new"
        element={
          <ProtectedRoute>
            <ProductForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/products/edit/:id"
        element={
          <ProtectedRoute>
            <ProductForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/categories"
        element={
          <ProtectedRoute>
            <CategoryList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/brands"
        element={
          <ProtectedRoute>
            <BrandList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/purchases"
        element={
          <ProtectedRoute>
            <ImportList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/purchases/new"
        element={
          <ProtectedRoute>
            <ImportForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/purchases/edit/:id"
        element={
          <ProtectedRoute>
            <ImportForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales"
        element={
          <ProtectedRoute>
            <SaleList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales/new"
        element={
          <ProtectedRoute>
            <SaleForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales/:id"
        element={
          <ProtectedRoute>
            <SaleDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payments"
        element={
          <ProtectedRoute>
            <PaymentList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payments/new"
        element={
          <ProtectedRoute>
            <PaymentForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payments/edit/:id"
        element={
          <ProtectedRoute>
            <PaymentForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/suppliers"
        element={
          <ProtectedRoute>
            <SupplierList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/suppliers/new"
        element={
          <ProtectedRoute>
            <SupplierForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/suppliers/edit/:id"
        element={
          <ProtectedRoute>
            <SupplierForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customers"
        element={
          <ProtectedRoute>
            <CustomerList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customers/new"
        element={
          <ProtectedRoute>
            <CustomerForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <SaleReport />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports/sales"
        element={
          <ProtectedRoute>
            <SaleReport />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports/imports"
        element={
          <ProtectedRoute>
            <ImportReport />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports/profit"
        element={
          <ProtectedRoute>
            <ProfitReport />
          </ProtectedRoute>
        }
      />
      
      {/* User Management Routes */}
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <UserList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff"
        element={
          <ProtectedRoute>
            <StaffList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users/new"
        element={
          <ProtectedRoute>
            <UserForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users/edit/:id"
        element={
          <ProtectedRoute>
            <UserForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users/:id"
        element={
          <ProtectedRoute>
            <UserForm />
          </ProtectedRoute>
        }
      />
      
      {/* Role Management Routes */}
      <Route
        path="/roles"
        element={
          <ProtectedRoute>
            <RoleList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/roles/new"
        element={
          <ProtectedRoute>
            <RoleForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/roles/edit/:id"
        element={
          <ProtectedRoute>
            <RoleForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/roles/:id"
        element={
          <ProtectedRoute>
            <RoleForm />
          </ProtectedRoute>
        }
      />
      
      {/* Notification Routes */}
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <NotificationList />
          </ProtectedRoute>
        }
      />
      
      {/* Settings Route */}
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      
      <Route path="/forbidden" element={<Forbidden />} />

      {/* Default Route */}
      <Route
        path="/"
        element={
          <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
        }
      />
    <Route path="/logout"  />
      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
