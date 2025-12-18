import { api } from './api';
import axios from 'axios';

// Guest API instance for public endpoints
// Use environment variable or default to Laravel API URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const guestApi = axios.create({
  baseURL: `${API_BASE_URL}/guest`,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
  withCredentials: true,
  timeout: 10000, // 10 seconds
});

export const lawyersService = {
  // Get all lawyers - try guest endpoint first, fallback to employee endpoint
  getLawyers: async (params = {}) => {
    try {
      // Try guest endpoint first (public)
      const response = await guestApi.get('/lawyers', { params });
      return response;
    } catch (error) {
      // If 404, endpoint not implemented - try employee endpoint with auth
      if (error.response?.status === 404) {
        try {
          const response = await api.get('/lawyers', { params });
          return response;
        } catch (employeeError) {
          // If employee endpoint also fails, log and throw
          console.error('Both guest and employee endpoints failed:', employeeError);
          throw employeeError;
        }
      }
      // For other errors, throw immediately
      throw error;
    }
  },

  // Get single lawyer - try guest endpoint first, fallback to employee endpoint
  getLawyer: async (id) => {
    try {
      const response = await guestApi.get(`/lawyers/${id}`);
      return response;
    } catch (error) {
      // If 404, endpoint not implemented - try employee endpoint with auth
      if (error.response?.status === 404) {
        try {
          const response = await api.get(`/lawyers/${id}`);
          return response;
        } catch (employeeError) {
          console.error('Both guest and employee endpoints failed:', employeeError);
          throw employeeError;
        }
      }
      // For other errors, throw immediately
      throw error;
    }
  },
};

