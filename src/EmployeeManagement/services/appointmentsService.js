import { api } from './api';

export const appointmentsService = {
  getAppointments: (params = {}) => api.get('/appointments', { params }),
  getAppointment: (id) => api.get(`/appointments/${id}`),
  updateAppointment: (id, data) => api.put(`/appointments/${id}`, data),
  confirmAppointment: (id) => api.post(`/appointments/${id}/confirm`),
  cancelAppointment: (id, reason) => api.post(`/appointments/${id}/cancel`, { cancellation_reason: reason }),
  deleteAppointment: (id) => api.delete(`/appointments/${id}`),
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
};

