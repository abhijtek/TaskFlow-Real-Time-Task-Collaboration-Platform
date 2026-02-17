import axios from "axios";
import { API_BASE_URL } from "@/lib/constants";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("taskflow_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor: unwrap data, handle 401
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("taskflow_token");
        localStorage.removeItem("taskflow_user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error.response?.data || { error: "Network error" });
  }
);

export default api;

