import { api } from './api';

export const consultationsService = {
  getConsultations: (params = {}) => api.get('/consultations', { params }),
  getConsultation: (id) => api.get(`/consultations/${id}`),
  acceptConsultation: (id, data) => api.post(`/consultations/${id}/accept`, data),
  rejectConsultation: (id, data) => api.post(`/consultations/${id}/reject`, data),
  completeConsultation: (id, data) => api.post(`/consultations/${id}/complete`, data),
  sendMessage: (consultationId, data) => {
    const formData = new FormData();
    formData.append('message', data.message);
    if (data.attachment) {
      formData.append('attachment', data.attachment);
    }
    return api.post(`/consultations/${consultationId}/messages`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getMessages: (consultationId) => api.get(`/consultations/${consultationId}/messages`),
};

