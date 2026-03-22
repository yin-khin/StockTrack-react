// src/App.jsx
import React from "react";
import { BrowserRouter as Router, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";
import AppRoutes from "./routes/AppRoutes";
import "./styles/global.css";

const AppContent = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  
  // Don't show header/sidebar on auth pages
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  if (isAuthPage) {
    return (
      <div className="min-h-screen">
        <AppRoutes />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      {isAuthenticated && <Header />}

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {isAuthenticated && <Sidebar />}

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6 bg-gray-50">
          <AppRoutes />
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </Router>
  );
};

export default App;
