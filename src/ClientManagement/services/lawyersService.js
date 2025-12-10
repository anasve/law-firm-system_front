import { api } from './api';
import axios from 'axios';

// Guest API instance for public endpoints
const guestApi = axios.create({
  baseURL: import.meta.env.DEV ? "/api/guest" : "http://127.0.0.1:8000/api/guest",
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
  withCredentials: true
});

export const lawyersService = {
  // Get all lawyers (public endpoint)
  getLawyers: async (params = {}) => {
    try {
      // Try guest endpoint first (public)
      const response = await guestApi.get('/lawyers', { params });
      return response;
    } catch (error) {
      console.error('Failed to fetch lawyers from guest endpoint:', error);
      // If guest endpoint fails, try client endpoint with auth
      try {
        const response = await api.get('/lawyers', { params });
        return response;
      } catch (clientError) {
        console.error('Failed to fetch lawyers from client endpoint:', clientError);
        throw clientError;
      }
    }
  },

  // Get single lawyer
  getLawyer: async (id) => {
    try {
      const response = await guestApi.get(`/lawyers/${id}`);
      return response;
    } catch (error) {
      console.error('Failed to fetch lawyer from guest endpoint:', error);
      try {
        const response = await api.get(`/lawyers/${id}`);
        return response;
      } catch (clientError) {
        console.error('Failed to fetch lawyer from client endpoint:', clientError);
        throw clientError;
      }
    }
  },
};

