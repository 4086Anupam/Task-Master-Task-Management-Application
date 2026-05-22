import api from '../lib/axios';

export const AdminService = {
  getUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  deactivateUser: async (id) => {
    const response = await api.put(`/admin/users/${id}/deactivate`);
    return response.data;
  },

  restoreUser: async (id) => {
    const response = await api.put(`/admin/users/${id}/restore`);
    return response.data;
  },

  getAuditLogs: async () => {
    const response = await api.get('/admin/audit-logs');
    return response.data;
  },

  createTask: async (taskData) => {
    const response = await api.post('/admin/task', taskData);
    return response.data;
  },

  getAllTasks: async () => {
    const response = await api.get('/admin/tasks');
    return response.data;
  },

  getTaskById: async (id) => {
    const response = await api.get(`/admin/task/${id}`);
    return response.data;
  },

  updateTask: async (id, taskData) => {
    const response = await api.put(`/admin/task/${id}`, taskData);
    return response.data;
  },

  updateTaskStatus: async (id, status) => {
    const response = await api.put(`/admin/task/${id}/status?status=${status}`);
    return response.data;
  },

  updateEmployeeTaskStatus: async (id, status) => {
    const response = await api.put(`/employee/task/${id}/status?status=${status}`);
    return response.data;
  },

  deleteTask: async (id) => {
    const response = await api.delete(`/admin/task/${id}`);
    return response.data;
  }
};
