import axios from "axios";

// Use environment variable or default to Laravel API URL
const BASE_API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
export const API_BASE_URL = BASE_API_URL;
export const API_BASE_URL_FULL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8000';

export const api = axios.create({
  baseURL: `${BASE_API_URL}/guest`,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
  withCredentials: true,
  timeout: 10000, // 10 seconds
});

