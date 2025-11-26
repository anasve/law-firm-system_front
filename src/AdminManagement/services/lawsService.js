import { api } from "./api";

export const lawsService = {
  // Get all laws
  getAll: (params = {}) => api.get("/laws", { params }),

  // Get laws by status
  getByStatus: (status, params = {}) => 
    api.get("/laws", { params: { status, ...params } }),

  // Get single law
  getById: (id) => api.get(`/laws/${id}`),

  // Create new law
  create: (data) => api.post("/laws", data),

  // Update law
  update: (id, data) => api.put(`/laws/${id}`, data),

  // Update law status
  updateStatus: (id, status) => api.put(`/laws/${id}`, { status }),

  // Delete law (soft delete)
  delete: (id) => api.delete(`/laws/${id}`),

  // Force delete law
  forceDelete: (id) => api.delete(`/laws/${id}/force`),
};

