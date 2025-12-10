import { api } from './api';

export const appointmentsService = {
  // Get available slots
  getAvailableSlots: (lawyerId, date) => {
    return api.get(`/lawyers/${lawyerId}/available-slots`, { params: { date } });
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
  rescheduleAppointment: (id, availabilityId) => {
    return api.post(`/appointments/${id}/reschedule`, { availability_id: availabilityId });
  },
};

