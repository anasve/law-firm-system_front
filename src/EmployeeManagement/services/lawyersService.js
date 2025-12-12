import { api } from './api';

export const lawyersService = {
  // Get all lawyers
  getLawyers: (params = {}) => {
    return api.get('/lawyers', { params });
  },

  // Get single lawyer
  getLawyer: (id) => {
    return api.get(`/lawyers/${id}`);
  },
};

