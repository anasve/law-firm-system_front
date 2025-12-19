import { api } from './api';

export const financialService = {
  // Get all invoices with summary
  getInvoices: (params = {}) => api.get('/invoices', { params }),

  // Get invoice details
  getInvoiceById: (id) => api.get(`/invoices/${id}`),

  // Get fixed prices
  getFixedPrices: () => api.get('/fixed-prices'),

  // Download invoice PDF
  downloadInvoicePDF: (id) => api.get(`/invoices/${id}/download`, {
    responseType: 'blob',
  }),
};

