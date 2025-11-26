import axios from "axios";
import { API_BASE_URL, TOKEN_KEY } from "../utils/constants";

// Create axios instance with base config
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
  withCredentials: true
});

// Add request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper function to get token
export const getToken = () => localStorage.getItem(TOKEN_KEY);

// Helper function to set token
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);

// Helper function to remove token
export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

