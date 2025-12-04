import { api } from "./api";

export const usersService = {
  // Lawyers
  getLawyers: () => api.get("/lawyers"),
  getArchivedLawyers: () => api.get("/lawyers-archived/"),
  getLawyerById: (id) => api.get(`/lawyers/${id}`),
  createLawyer: (data) => api.post("/lawyers", data),
  updateLawyer: (id, data) => api.post(`/lawyers/${id}`, data),
  archiveLawyer: (id) => api.delete(`/lawyers/${id}`),
  restoreLawyer: (id) => api.put(`/lawyers/${id}/restore`, null),
  deleteLawyer: (id) => api.delete(`/lawyers/${id}/force`),
  getLawyersTotal: () => api.get("/lawyers/total"),

  // Employees
  getEmployees: () => api.get("/employees"),
  getArchivedEmployees: () => api.get("/employees-archived/"),
  getEmployeeById: (id) => api.get(`/employees/${id}`),
  createEmployee: (data) => api.post("/employees", data),
  updateEmployee: (id, data) => api.post(`/employees/${id}`, data),
  archiveEmployee: (id) => api.delete(`/employees/${id}`),
  restoreEmployee: (id) => api.put(`/employees/${id}/restore`, null),
  deleteEmployee: (id) => api.delete(`/employees/${id}/force`),
  getEmployeesTotal: () => api.get("/employees/total"),

  // Specializations
  getSpecializations: () => api.get("/specializations"),
  getArchivedSpecializations: () => api.get("/specializations-archived"),
  createSpecialization: (data) => api.post("/specializations", data),
  updateSpecialization: (id, data) => api.put(`/specializations/${id}`, data),
  archiveSpecialization: (id) => api.delete(`/specializations/${id}`),
  restoreSpecialization: (id) => api.put(`/specializations/${id}/restore`, null),
  deleteSpecialization: (id) => api.delete(`/specializations/${id}/force`), // Force delete
};

