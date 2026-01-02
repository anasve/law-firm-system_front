import { api } from './api';

export const fixedPricesService = {
  // Get all fixed prices
  getAll: (params = {}) => api.get('/fixed-prices', { params }),

  // Get active fixed prices
  getActive: (params = {}) => api.get('/fixed-prices/active', { params }),

  // Get archived fixed prices
  getArchived: (params = {}) => api.get('/fixed-prices/archived', { params }),

  // Get fixed price by ID
  getById: (id) => api.get(`/fixed-prices/${id}`),

  // Create fixed price
  create: (data) => api.post('/fixed-prices', data),

  // Update fixed price
  update: (id, data) => api.put(`/fixed-prices/${id}`, data),

  // Delete fixed price (soft delete)
  delete: (id) => api.delete(`/fixed-prices/${id}`),

  // Restore archived fixed price
  restore: (id) => api.put(`/fixed-prices/${id}/restore`),

  // Force delete fixed price (permanent delete)
  forceDelete: (id) => api.delete(`/fixed-prices/${id}/force`),
};



