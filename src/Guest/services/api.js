import axios from "axios";

// Use environment variable or default to Laravel API URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: `${API_BASE_URL}/guest`,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
  withCredentials: true,
  timeout: 10000, // 10 seconds
});

