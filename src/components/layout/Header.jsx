import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LogOut, Settings } from "lucide-react";
import NotificationDropdown from "../notifications/NotificationDropdown";
import ims from "../../assets/images/LgIMS.png";

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getPhotoUrl = () => {
    if (!user?.photo || user.photo.trim() === "") return null;
    const photo = user.photo.trim();

    if (photo.startsWith("data:")) return photo;

    if (
      photo.match(/^[A-Za-z0-9+/=]+$/) ||
      photo.includes("/9j/") ||
      photo.includes("iVBOR")
    ) {
      return `data:image/jpeg;base64,${photo}`;
    }

    if (photo.startsWith("http")) return photo;

    return null;
  };

  const photoUrl = getPhotoUrl();
  const initials = user?.name?.charAt(0)?.toUpperCase() || "?";

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="mx-auto flex h-[70px]  items-center justify-between px-4 sm:px-6">
        {/* Left - Logo & Title */}
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 shadow-sm flex items-center justify-center overflow-hidden">
            <img src={ims} alt="IMS" className="h-14 w-14 object-contain" />
          </div>
          <span className="hidden uppercase sm:block text-base font-bold text-gray-900 group-hover:text-blue-600 transition">
            StockTrack Pro
          </span>
        </Link>

        {/* Right - Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div className="hover:bg-gray-50 bg-slate-200 rounded-lg transition">
            <NotificationDropdown />
          </div>

          {/* Settings */}
          <Link
            to="/settings"
            className="inline-flex items-center justify-center rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition"
            title="Settings"
          >
            <Settings className="h-5 w-5" />
          </Link>

          {/* User Info */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-gray-50">
            <div className="h-7 w-7 overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={user?.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                initials
              )}
            </div>
            <div className="max-w-[120px]">
              <p className="text-xs font-semibold text-gray-900 truncate leading-tight">
                {user?.name || "User"}
              </p>
              <p className="text-[10px] text-gray-500 truncate leading-tight">
                {user?.role || "Role"}
              </p>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1.5 text-sm font-medium hover:from-blue-700 hover:to-indigo-700 transition shadow-sm"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
