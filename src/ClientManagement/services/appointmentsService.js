import { api } from './api';

export const appointmentsService = {
  // Get available slots for a specific date
  getAvailableSlots: (lawyerId, date) => {
    // Ensure date is in YYYY-MM-DD format
    const formattedDate = date ? date.split('T')[0] : date;
    const url = `/lawyers/${lawyerId}/available-slots`;
    const params = { date: formattedDate };
    return api.get(url, { params });
  },

  // Get calendar month view
  getCalendarMonth: (lawyerId, year, month) => {
    const url = `/appointments/calendar/month`;
    const params = { year, month, lawyer_id: lawyerId };
    return api.get(url, { params });
  },

  // Get all appointments
  getAppointments: (params = {}) => {
    return api.get('/appointments', { params });
  },

  // Get single appointment
  getAppointment: (id) => {
    return api.get(`/appointments/${id}`);
  },

  // Book direct appointment
  bookDirectAppointment: (data) => {
    return api.post('/appointments/direct', data);
  },

  // Book appointment for consultation
  bookConsultationAppointment: (consultationId, data) => {
    return api.post(`/consultations/${consultationId}/appointments`, data);
  },

  // Cancel appointment
  cancelAppointment: (id, reason) => {
    return api.post(`/appointments/${id}/cancel`, { cancellation_reason: reason });
  },

  // Reschedule appointment
  rescheduleAppointment: (id, data) => {
    return api.post(`/appointments/${id}/reschedule`, data);
  },
};

