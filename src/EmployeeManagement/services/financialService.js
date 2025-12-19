import { api } from './api';

export const financialService = {
  // Get all invoices
  getInvoices: (params = {}) => api.get('/invoices', { params }),

  // Get invoice details
  getInvoiceById: (id) => api.get(`/invoices/${id}`),

  // Create invoice
  createInvoice: (data) => api.post('/invoices', data),

  // Update invoice
  updateInvoice: (id, data) => api.put(`/invoices/${id}`, data),

  // Delete invoice
  deleteInvoice: (id) => api.delete(`/invoices/${id}`),

  // Get fixed prices
  getFixedPrices: () => api.get('/fixed-prices'),
  
  // Get active fixed prices
  getActiveFixedPrices: () => api.get('/fixed-prices/active'),
  
  // Get archived fixed prices
  getArchivedFixedPrices: () => api.get('/fixed-prices/archived'),
  
  // Create fixed price
  createFixedPrice: (data) => api.post('/fixed-prices', data),
  
  // Update fixed price
  updateFixedPrice: (id, data) => api.put(`/fixed-prices/${id}`, data),
  
  // Delete fixed price (soft delete/archive)
  deleteFixedPrice: (id) => api.delete(`/fixed-prices/${id}`),
  
  // Restore archived fixed price
  restoreFixedPrice: (id) => api.put(`/fixed-prices/${id}/restore`),
  
  // Force delete fixed price (permanent delete)
  forceDeleteFixedPrice: (id) => api.delete(`/fixed-prices/${id}/force`),
};

