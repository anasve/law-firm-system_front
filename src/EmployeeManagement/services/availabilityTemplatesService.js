import { api } from './api';

export const availabilityTemplatesService = {
  createTemplate: (data) => api.post('/availability-templates', data),
  getTemplates: (params = {}) => api.get('/availability-templates', { params }),
  updateTemplate: (id, data) => api.put(`/availability-templates/${id}`, data),
  deleteTemplate: (id) => api.delete(`/availability-templates/${id}`),
  applyTemplate: (id, data) => api.post(`/availability-templates/${id}/apply`, data),
};

