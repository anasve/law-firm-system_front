import { api } from './api';

export const consultationsService = {
  getConsultations: (params = {}) => api.get('/consultations', { params }),
  getConsultation: (id) => api.get(`/consultations/${id}`),
  getPendingConsultations: () => api.get('/consultations/pending'),
  assignConsultation: (id, lawyerId) => api.post(`/consultations/${id}/assign`, { lawyer_id: lawyerId }),
  autoAssignConsultation: (id) => api.post(`/consultations/${id}/auto-assign`),
  getStatistics: () => api.get('/consultations/statistics'),
};

