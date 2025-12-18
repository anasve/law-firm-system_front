import { api } from './api';

export const lawsService = {
  getLaws: (params = {}) => api.get('/laws', { params }),
  getLaw: (id) => api.get(`/laws/${id}`),
  getCategories: () => api.get('/laws/categories'),
};

