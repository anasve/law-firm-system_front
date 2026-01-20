import { api } from './api';

export const clientsService = {
  getClients: (params = {}) => api.get('/clients', { params }),
  getClient: (id) => api.get(`/clients/${id}`),
  getPendingClients: () => api.get('/clients/pending-verified'),
  getApprovedClients: () => api.get('/clients/approved'),
  getRejectedClients: () => api.get('/clients/rejected'),
  getSuspendedClients: () => api.get('/clients/suspended'),
  getArchivedClients: () => api.get('/clients/archived'),
  createClient: (data) => {
    // If FormData, let axios set Content-Type automatically
    const config = data instanceof FormData ? {} : {};
    return api.post('/clients', data, config);
  },
  updateClient: (id, data) => {
    // If FormData, let axios set Content-Type automatically
    const config = data instanceof FormData ? {} : {};
    return api.post(`/clients/${id}`, data, config);
  },
  activateClient: (id) => api.post(`/clients/${id}/activate`),
  rejectClient: (id) => api.post(`/clients/${id}/reject`),
  suspendClient: (id) => api.post(`/clients/${id}/suspend`, {}),
  archiveClient: (id) => api.delete(`/clients/${id}`),
  restoreClient: (id) => api.put(`/clients/${id}/restore`),
  deleteClient: (id) => api.delete(`/clients/${id}`),
  forceDeleteClient: (id) => api.delete(`/clients/${id}/force`),
};

