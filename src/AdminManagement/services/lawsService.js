import { api } from "./api";

export const lawsService = {
  // Get all laws
  getAll: (params = {}) => api.get("/laws", { params }),

  // Get laws by status
  getPublished: (params = {}) => api.get("/laws/published", { params }),
  getDraft: (params = {}) => api.get("/laws/draft", { params }),
  getArchived: (params = {}) => api.get("/laws/archived", { params }),

  // Get single law
  getById: (id) => api.get(`/laws/${id}`),

  // Create new law
  create: (data) => api.post("/laws", data),

  // Update law
  update: (id, data) => api.put(`/laws/${id}`, data),

  // Update law status
  toggleStatus: (id, status) => api.post(`/laws/${id}/toggle-status`, { status }),

  // Archive law (soft delete)
  archive: (id) => api.delete(`/laws/${id}`),

  // Restore law
  restore: (id) => api.put(`/laws/${id}/restore`, null),

  // Force delete law
  forceDelete: (id) => api.delete(`/laws/${id}/force`),
};
