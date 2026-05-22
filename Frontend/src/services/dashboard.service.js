import api from '../lib/axios';

export const DashboardService = {
  getSummary: async () => {
    const response = await api.get('/dashboard/summary');
    return response.data;
  },

  getProjectsProgress: async () => {
    const response = await api.get('/dashboard/projects-progress');
    return response.data;
  },

  filterTasks: async (params) => {
    const response = await api.get('/dashboard/filter-tasks', { params });
    return response.data;
  }
};
