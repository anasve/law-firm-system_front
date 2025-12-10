import { api } from './api';

export const appointmentsService = {
  getAppointments: (params = {}) => api.get('/appointments', { params }),
  getAppointment: (id) => api.get(`/appointments/${id}`),
  getUpcomingAppointments: () => api.get('/appointments/upcoming'),
};

