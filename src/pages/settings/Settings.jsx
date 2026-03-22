// src/pages/settings/Settings.jsx
import { useState, useEffect } from "react";
import {
  Settings as SettingsIcon,
  Shield,
  Database,
  Bell,
  Palette,
  Save,
  RefreshCw,
  User,
  Upload,
  Eye,
  EyeOff,
  Camera,
  Mail,
  Phone,
  Lock,
  Check,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { AdminOnly, hasPermission } from "../../utils/permissions";
import { getSettings, updateSettings } from "../../api/settings.api";
import { getUserById, updateUser } from "../../api/user.api";

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [imagePreview, setImagePreview] = useState("");

  // Profile state
  const [profileData, setProfileData] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    photo: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [settings, setSettings] = useState({
    siteName: "Inventory Management System",
    siteDescription: "ប្រព័ន្ធគ្រប់គ្រងស្តុក",
    language: "km",
    timezone: "Asia/Phnom_Penh",
    currency: "USD",
    autoBackup: true,
    backupFrequency: "daily",
    maxLoginAttempts: 5,
    sessionTimeout: 30,
    emailNotifications: true,
    systemAlerts: true,
    lowStockAlerts: true,
    lowStockThreshold: 10,
    criticalStockThreshold: 5,
    autoStockCheck: true,
    stockCheckInterval: 30,
    theme: "light",
    itemsPerPage: 10,
    dateFormat: "DD/MM/YYYY",
    numberFormat: "1,234.56",
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await fetchProfile();
      } catch (err) {
        console.error("Initial load failed:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfile = async () => {
    try {
      if (!user?.id) return;

      const response = await getUserById(user.id);
      if (response && (response.user || response.data)) {
        const userData = response.user || response.data;
        setProfileData({
          name: userData.name || "",
          username: userData.username || "",
          email: userData.email || "",
          phone: userData.phone || "",
          photo: userData.photo || "",
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        if (userData.photo) {
          setImagePreview(userData.photo);
        }
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("រូបភាពធំពេក។ សូមជ្រើសរើសរូបភាពតូចជាង 5MB");
        setTimeout(() => setError(null), 3000);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setProfileData((prev) => ({
          ...prev,
          photo: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate password if changing
      if (profileData.newPassword) {
        if (profileData.newPassword.length < 6) {
          setError("ពាក្យសម្ងាត់ត្រូវតែមានយ៉ាងហោចណាស់ 6 តួអក្សរ");
          setSaving(false);
          return;
        }
        if (profileData.newPassword !== profileData.confirmPassword) {
          setError("ពាក្យសម្ងាត់មិនត្រូវគ្នាទេ");
          setSaving(false);
          return;
        }
      }

      const updateData = {
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        photo: profileData.photo,
      };

      if (profileData.newPassword) {
        updateData.password = profileData.newPassword;
      }

      const response = await updateUser(user.id, updateData);

      if (response && (response.success === true || response.user)) {
        setSuccess("បានរក្សាទុកព័ត៌មានផ្ទាល់ខ្លួនដោយជោគជ័យ");
        // Clear password fields
        setProfileData((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
        setTimeout(() => setSuccess(null), 3500);
      } else {
        setError(response?.message || "មិនអាចរក្សាទុកបានទេ");
      }
    } catch (err) {
      console.error("Profile save error:", err);
      setError("មានបញ្ហាក្នុងការរក្សាទុក សូមព្យាយាមម្ដងទៀត");
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    {
      id: "profile",
      label: "ប្រវត្តិរូប",
      icon: <User className="h-5 w-5" />,
      color: "from-blue-500 to-blue-600",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <div className="text-center space-y-4">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="text-slate-600 font-semibold text-lg">
            កំពុងទាញយកទិន្នន័យ...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br  p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r p-8 shadow-sm">
          <div className="absolute inset-0 " />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3  backdrop-blur-sm rounded-xl">
                <SettingsIcon className="h-8 w-8 text-black" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-black drop-shadow-md">
                  ការកំណត់
                </h1>
                <p className="text-black mt-1">
                  គ្រប់គ្រងការកំណត់ប្រព័ន្ធ និងព័ត៌មានផ្ទាល់ខ្លួន
                </p>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
        </div>

        {/* Messages */}
        {error && (
          <div className="rounded-xl bg-red-50 border-2 border-red-200 p-4 flex items-center gap-3 animate-in slide-in-from-top">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
              <X className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-red-800 font-medium">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {success && (
          <div className="rounded-xl bg-emerald-50 border-2 border-emerald-200 p-4 flex items-center gap-3 animate-in slide-in-from-top">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <Check className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="text-emerald-800 font-medium">{success}</p>
            </div>
            <button
              onClick={() => setSuccess(null)}
              className="text-emerald-400 hover:text-emerald-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Main Content */}
        <div className="rounded-2xl   overflow-hidden border border-slate-200">
          {/* Profile Content */}
          <div className="p-8">
            {/* Photo Upload Section */}
            <div className="flex flex-col items-center mb-8 pb-8 border-b border-slate-200">
              <div className="relative group">
                <div className="relative">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl ring-4 ring-blue-100 transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center border-4 border-white shadow-xl ring-4 ring-blue-100 transition-transform group-hover:scale-105">
                      <User className="h-16 w-16 text-blue-600" />
                    </div>
                  )}

                  {/* Camera overlay */}
                  <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="h-8 w-8 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Upload button */}
                <label className="absolute -bottom-2 -right-2 p-3 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-full cursor-pointer shadow-lg transition-all hover:scale-110">
                  <Upload className="h-4 w-4 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>

              <p className="text-sm text-slate-500 mt-4 text-center">
                ចុចលើរូបភាព ឬប៊ូតុង <Upload className="inline h-3 w-3" />{" "}
                ដើម្បីផ្លាស់ប្តូរ
              </p>
              <p className="text-xs text-slate-400 mt-1">
                រូបភាពត្រូវតែតូចជាង 5MB
              </p>
            </div>

            {/* Profile Information */}
            <div className="space-y-6 mb-8">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                ព័ត៌មានផ្ទាល់ខ្លួន
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    ឈ្មោះ <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="បញ្ចូលឈ្មោះ"
                    />
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  </div>
                </div>

                {/* Username */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    ឈ្មោះអ្នកប្រើប្រាស់
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={profileData.username}
                      disabled
                      className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl bg-slate-50 text-slate-500 cursor-not-allowed"
                    />
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    មិនអាចកែប្រែបានទេ
                  </p>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    អ៊ីមែល
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="example@email.com"
                    />
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    លេខទូរស័ព្ទ
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="012 345 678"
                    />
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Change Password Section */}
            <div className="pt-8 border-t border-slate-200 space-y-6">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Lock className="h-5 w-5 text-blue-600" />
                ផ្លាស់ប្តូរពាក្យសម្ងាត់
              </h3>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-800">
                  <strong>ចំណាំ:</strong>{" "}
                  ទុកវាលទទេប្រសិនបើមិនចង់ផ្លាស់ប្តូរពាក្យសម្ងាត់
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* New Password */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    ពាក្យសម្ងាត់ថ្មី
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={profileData.newPassword}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          newPassword: e.target.value,
                        }))
                      }
                      className="w-full pl-10 pr-12 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="បញ្ចូលពាក្យសម្ងាត់ថ្មី"
                    />
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500">
                    យ៉ាងហោចណាស់ 6 តួអក្សរ
                  </p>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    បញ្ជាក់ពាក្យសម្ងាត់
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={profileData.confirmPassword}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          confirmPassword: e.target.value,
                        }))
                      }
                      className="w-full pl-10 pr-12 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="បញ្ជាក់ពាក្យសម្ងាត់"
                    />
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8 pt-8 border-t border-slate-200">
              <button
                type="button"
                onClick={fetchProfile}
                className="px-6 py-3 border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="h-5 w-5" />
                កំណត់ឡើងវិញ
              </button>
              <button
                onClick={handleProfileSave}
                disabled={saving}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    កំពុងរក្សាទុក...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    រក្សាទុកការផ្លាស់ប្តូរ
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
