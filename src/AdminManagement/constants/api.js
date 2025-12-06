// API Base URL - use relative path in development (with proxy), absolute in production
export const API_BASE_URL = import.meta.env.DEV 
  ? "/api/admin" 
  : "http://127.0.0.1:8000/api/admin";

// API Base URL for images
export const API_BASE_URL_FULL = import.meta.env.DEV 
  ? "" 
  : "http://127.0.0.1:8000";

// Token key
export const TOKEN_KEY = "adminToken";

