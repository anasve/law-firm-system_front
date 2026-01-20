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
  submitJobApplication: (formData) => {
    // Don't set Content-Type header, let axios handle it automatically for FormData
    const config = formData instanceof FormData ? {} : {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    return api.post('/job-applications', formData, config);
  },
};

