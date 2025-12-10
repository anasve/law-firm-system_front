import { api } from './api';

export const availabilityService = {
  createSchedule: (data) => api.post('/availability/create-schedule', data),
  createAvailability: (data) => api.post('/availability', data),
  getAvailabilities: (params = {}) => api.get('/availability', { params }),
  updateAvailability: (id, data) => api.put(`/availability/${id}`, data),
  deleteAvailability: (id) => api.delete(`/availability/${id}`),
  batchCreate: (data) => api.post('/availability/batch', data),
};

