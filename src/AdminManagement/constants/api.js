// API Base URL - use environment variable or default to Laravel API URL
const BASE_API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const API_BASE_URL = `${BASE_API_URL}/admin`;

// API Base URL for images
export const API_BASE_URL_FULL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8000';

// Token key
export const TOKEN_KEY = "adminToken";

