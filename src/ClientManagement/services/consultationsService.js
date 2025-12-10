import { api } from './api';

export const consultationsService = {
  // Get all consultations
  getConsultations: (params = {}) => {
    return api.get('/consultations', { params });
  },

  // Get single consultation
  getConsultation: (id) => {
    return api.get(`/consultations/${id}`);
  },

  // Create consultation
  createConsultation: (data) => {
    const formData = new FormData();
    
    // Add required fields first
    formData.append('subject', data.subject || '');
    formData.append('description', data.description || '');
    formData.append('priority', data.priority || 'normal');
    formData.append('preferred_channel', data.preferred_channel || 'chat');
    
    // Add optional fields only if they have valid values
    if (data.lawyer_id && !isNaN(data.lawyer_id) && data.lawyer_id > 0) {
      formData.append('lawyer_id', data.lawyer_id.toString());
    }
    
    if (data.specialization_id && !isNaN(data.specialization_id) && data.specialization_id > 0) {
      formData.append('specialization_id', data.specialization_id.toString());
    }
    
    // Add appointment fields only if preferred_channel is 'appointment'
    if (data.preferred_channel === 'appointment') {
      if (data.appointment_availability_id && !isNaN(data.appointment_availability_id) && data.appointment_availability_id > 0) {
        formData.append('appointment_availability_id', data.appointment_availability_id.toString());
      }
      if (data.appointment_type) {
        formData.append('appointment_type', data.appointment_type);
      }
      if (data.appointment_meeting_link && data.appointment_meeting_link.trim()) {
        formData.append('appointment_meeting_link', data.appointment_meeting_link.trim());
      }
      if (data.appointment_notes && data.appointment_notes.trim()) {
        formData.append('appointment_notes', data.appointment_notes.trim());
      }
    }
    
    // Add attachments if they exist
    if (data.attachments && Array.isArray(data.attachments) && data.attachments.length > 0) {
      data.attachments.forEach((file) => {
        if (file instanceof File) {
          // Laravel expects attachments[] for multiple files
          formData.append('attachments[]', file);
        }
      });
    }
    
    // Log FormData contents for debugging
    console.log('FormData entries:');
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + (pair[1] instanceof File ? pair[1].name : pair[1]));
    }
    
    return api.post('/consultations', formData, {
      headers: { 
        'Content-Type': 'multipart/form-data',
      }
    });
  },

  // Cancel consultation
  cancelConsultation: (id) => {
    return api.post(`/consultations/${id}/cancel`);
  },

  // Send message
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

  // Get messages
  getMessages: (consultationId) => {
    return api.get(`/consultations/${consultationId}/messages`);
  },

  // Add review
  addReview: (consultationId, data) => {
    return api.post(`/consultations/${consultationId}/review`, data);
  },
};

