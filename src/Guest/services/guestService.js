import { api } from './api';

export const guestService = {
  // Laws
  getLaws: (params = {}) => api.get('/laws', { params }),
  getLaw: (id) => api.get(`/laws/${id}`),

  // Lawyers
  getLawyers: (params = {}) => api.get('/lawyers', { params }),
  getLawyer: (id) => api.get(`/lawyers/${id}`),

  // Specializations
  getSpecializations: (params = {}) => api.get('/specializations', { params }),
  getSpecialization: (id) => api.get(`/specializations/${id}`),

  // Job Applications
  submitJobApplication: (formData) => api.post('/job-applications', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
};

