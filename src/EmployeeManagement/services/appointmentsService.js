import { api } from './api';

export const appointmentsService = {
  getAppointments: (params = {}) => api.get('/appointments', { params }),
  getAppointment: (id) => api.get(`/appointments/${id}`),
  // Custom time requests
  getCustomTimeRequests: (params = {}) => api.get('/appointments/custom-time-requests', { params }),
  // Calendar endpoints
  getCalendarMonth: (year, month, lawyerId = null) => {
    const params = { year, month };
    if (lawyerId) params.lawyer_id = lawyerId;
    return api.get('/appointments/calendar/month', { params });
  },
  getCalendarWeek: (date, lawyerId = null) => {
    const params = { date };
    if (lawyerId) params.lawyer_id = lawyerId;
    return api.get('/appointments/calendar/week', { params });
  },
  getCalendarDay: (date, lawyerId = null) => {
    const params = { date };
    if (lawyerId) params.lawyer_id = lawyerId;
    return api.get('/appointments/calendar/day', { params });
  },
  createFromCalendar: (data) => api.post('/appointments/calendar/create', data),
  // Appointment actions
  acceptAppointment: (id) => api.post(`/appointments/${id}/accept`),
  rejectAppointment: (id) => api.post(`/appointments/${id}/reject`),
};

