import axios from 'axios';

const BASE_URL = 'https://graph-stray-couch.ngrok-free.dev/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' }
});

// Auth
export const loginAdmin = (data) => api.post('/auth/login', data);

// Employees
export const getEmployees = () => api.get('/employees');
export const addEmployee = (data) => api.post('/employees', data);
export const updateEmployee = (data) => api.put('/employees', data);
export const deleteEmployee = (id) => api.delete(`/employees/${id}`);
export const searchEmployees = (data) => api.post('/employees/search', data);

// Projects
export const getProjects = () => api.get('/projects');
export const addProject = (data) => api.post('/projects', data);
export const updateProject = (data) => api.put('/projects', data);
export const deleteProject = (id) => api.delete(`/projects/${id}`);

// Allocations
export const getAllocations = () => api.get('/allocations');
export const getProjectAllocations = (projectId) => api.get(`/allocations/project/${projectId}`);
export const allocateEmployee = (data) => api.post('/allocations', data);
export const removeAllocation = (id) => api.delete(`/allocations/${id}`);

export default api;


