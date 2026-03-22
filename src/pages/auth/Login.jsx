// // src/pages/auth/Login.jsx
// import React, { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { login } from '../../api/auth.api';
// import { useAuth } from '../../context/AuthContext';
// import {  Mail, Lock, Eye, EyeOff } from 'lucide-react';
// import imsLogo from "../../assets/images/ims.png"

// const Login = () => {
//   const [formData, setFormData] = useState({
//     username: '',
//     password: '',
//   });
//   const [showPassword, setShowPassword] = useState(false);
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();
//   const { setAuth } = useAuth();

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//     setError('');
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);

//     try {
//       const response = await login(formData);

//       // Ensure permissions array exists
//       const userData = {
//         ...response.user,
//         permissions: response.user.permissions || []
//       };

//       // Store token and user data
//       localStorage.setItem('token', response.token);
//       localStorage.setItem('user', JSON.stringify(userData));

//       // Update auth context
//       setAuth({
//         isAuthenticated: true,
//         user: userData,
//         token: response.token,
//       });

//       // Redirect to dashboard
//       navigate('/dashboard');
//     } catch (err) {
//       setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-md w-full space-y-8 bg-white rounded-2xl shadow-xl p-8">
//         {/* Logo and Title */}
//         <div className="text-center">
//           <div className="mx-auto h-20 w-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
//             {/* <LogIn className="h-8 w-8 text-white" />
//              */}
//              <img src={imsLogo} alt='IMS Logo' />
//           </div>
//           <h2 className="text-3xl font-extrabold text-gray-900">
//             Welcome Back
//           </h2>
//           <p className="mt-2 text-sm text-gray-600">
//             Sign in to your Inventory Management account
//           </p>
//         </div>

//         {/* Error Message */}
//         {error && (
//           <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
//             {error}
//           </div>
//         )}

//         {/* Login Form */}
//         <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
//           <div className="space-y-4">
//             {/* Username Field */}
//             <div>
//               <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
//                 Username
//               </label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <Mail className="h-5 w-5 text-gray-400" />
//                 </div>
//                 <input
//                   id="username"
//                   name="username"
//                   type="text"
//                   required
//                   value={formData.username}
//                   onChange={handleChange}
//                   className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                   placeholder="Enter your username"
//                 />
//               </div>
//             </div>

//             {/* Password Field */}
//             <div>
//               <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
//                 Password
//               </label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <Lock className="h-5 w-5 text-gray-400" />
//                 </div>
//                 <input
//                   id="password"
//                   name="password"
//                   type={showPassword ? 'text' : 'password'}
//                   required
//                   value={formData.password}
//                   onChange={handleChange}
//                   className="appearance-none block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                   placeholder="Enter your password"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute inset-y-0 right-0 pr-3 flex items-center"
//                 >
//                   {showPassword ? (
//                     <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
//                   ) : (
//                     <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
//                   )}
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Remember Me & Forgot Password */}
//           <div className="flex items-center justify-between">
//             <div className="flex items-center">
//               <input
//                 id="remember-me"
//                 name="remember-me"
//                 type="checkbox"
//                 className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//               />
//               <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
//                 Remember me
//               </label>
//             </div>

//             {/* <div className="text-sm">
//               <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
//                 Forgot password?
//               </Link>
//             </div> */}
//           </div>

//           {/* Submit Button */}
//           <button
//             type="submit"
//             disabled={loading}
//             className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
//           >
//             {loading ? (
//               <span className="flex items-center">
//                 <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                 </svg>
//                 Signing in...
//               </span>
//             ) : (
//               'Sign in'
//             )}
//           </button>

//           {/* Register Link */}
//           {/* <div className="text-center">
//             <p className="text-sm text-gray-600">
//               Don't have an account?{' '}
//               <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
//                 Sign up
//               </Link>
//             </p>
//           </div> */}
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Login;

// src/pages/auth/Login.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../api/auth.api";
import { useAuth } from "../../context/AuthContext";
import { User, Lock, Eye, EyeOff } from "lucide-react";

import imsLogo from "../../assets/images/logoIMS.png";
import loginIllus from "../../assets/images/stock-management-system-software.png";

const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const isValid = useMemo(() => {
    const u = formData.username.trim();
    const p = formData.password.trim();
    return u.length >= 3 && p.length >= 4;
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (error) setError("");
  };

  const persistAuth = ({ token, user }) => {
    const userData = { ...user, permissions: user?.permissions || [] };

    if (remember) {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
    } else {
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("user", JSON.stringify(userData));
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }

    setAuth({ isAuthenticated: true, user: userData, token });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid || loading) return;

    setLoading(true);
    setError("");

    try {
      const res = await login(formData);
      persistAuth({ token: res.token, user: res.user });
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-100 via-white to-slate-200 flex items-center justify-center p-6">
      {/* Bigger card */}
      <div className="w-full max-w-7xl bg-white rounded-[28px] overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.18)] grid grid-cols-1 lg:grid-cols-2 min-h-[650px]">
        {/* LEFT (Bigger Form) */}
        <div className="flex items-center justify-center p-10 sm:p-14">
          {/* Make form wider */}
          <div className="w-full max-w-md">
            {/* Logo */}
            <div className="flex flex-col items-center mb-10">
              <div className="h-30 w-30  rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center overflow-hidden">
                <img
                  src={imsLogo}
                  alt="IMS"
                  className="h-20 w-20 object-cover rounded-50"
                />
              </div>
              <h2 className="mt-5 text-2xl font-extrabold text-gray-900">
                Inventory Management System
              </h2>
              <p className="mt-2 text-sm text-gray-500 text-center">
                Login to access your inventory dashboard
              </p>
            </div>

            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Username
                </label>
                <div className="relative mt-2">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <User className="h-5 w-5" />
                  </span>
                  <input
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    placeholder="Enter username"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-4 text-sm outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative mt-2">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock className="h-5 w-5" />
                  </span>

                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Enter password"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-12 text-sm outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                    aria-label="Toggle password"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setRemember((r) => !r)}
                  className="flex items-center gap-3"
                >
                  <span
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                      remember ? "bg-orange-500" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                        remember ? "translate-x-5" : "translate-x-1"
                      }`}
                    />
                  </span>
                  <span className="text-sm text-gray-600">Remember me</span>
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={!isValid || loading}
                className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 py-4 text-base font-bold text-white shadow-md hover:from-orange-600 hover:to-orange-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {loading ? "Signing in..." : "Enter →"}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT (Image) */}
        <div className="relative hidden lg:block">
          <img
            src={loginIllus}
            alt="Login"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/35" />
          <div className="absolute inset-0 flex items-center justify-center p-12">
            <div className="text-center font-semibold shadow-lg">
              <h1 className="text-white text-2xl  font-semibold leading-snug drop-shadow">
                Welcome Back
              </h1>
              <p className="mt-3 text-white/90 text-2xl max-w-md mx-auto">
                Sign in to your Inventory Management account.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
