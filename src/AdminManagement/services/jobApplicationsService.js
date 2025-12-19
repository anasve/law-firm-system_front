import { api } from './api';

export const jobApplicationsService = {
  // Get all job applications
  getAll: (params = {}) => api.get('/job-applications', { params }),
  
  // Get job applications by type
  getLawyerApplications: (params = {}) => api.get('/job-applications/lawyer', { params }),
  getEmployeeApplications: (params = {}) => api.get('/job-applications/employee', { params }),
  
  // Get single application
  getById: (id) => api.get(`/job-applications/${id}`),
  
  // Approve application
  approve: (id) => api.post(`/job-applications/${id}/approve`),
  
  // Reject application
  reject: (id, reason) => api.post(`/job-applications/${id}/reject`, { reason }),
  
  // Delete application
  delete: (id) => api.delete(`/job-applications/${id}`),
};

