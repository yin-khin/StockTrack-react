// src/api/axios.js
import axios from "axios";

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:3001",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

instance.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default instance;

// // src/api/axios.js
// import axios from "axios";

// // ✅ Support CRA + Vite (choose one that exists)
// const API_URL =
//   process.env.REACT_APP_API_URL ||
//   (typeof import.meta !== "undefined" ? import.meta.env?.VITE_API_URL : "") ||
//   "http://localhost:3001";

// const instance = axios.create({
//   baseURL: API_URL, // Base URL without /api (as you want)
//   timeout: 10000,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// // ✅ helper: read token from localStorage OR sessionStorage
// const getToken = () =>
//   localStorage.getItem("token") || sessionStorage.getItem("token");

// const clearAuth = () => {
//   localStorage.removeItem("token");
//   localStorage.removeItem("user");
//   sessionStorage.removeItem("token");
//   sessionStorage.removeItem("user");
// };

// // Add a request interceptor
// instance.interceptors.request.use(
//   (config) => {
//     const token = getToken();
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // Add a response interceptor
// instance.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       // ✅ JWT expired (10m) or invalid => logout
//       clearAuth();
//       window.location.href = "/login";
//     }
//     return Promise.reject(error);
//   }
// );

// export default instance;
