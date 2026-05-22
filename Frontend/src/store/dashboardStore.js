import { create } from 'zustand';
import { DashboardService } from '../services/dashboard.service';

const useDashboardStore = create((set) => ({
  summary: null,
  projectsProgress: [],
  filteredTasks: [],
  isLoading: false,
  error: null,

  fetchSummary: async () => {
    set({ isLoading: true, error: null });
    try {
      const summary = await DashboardService.getSummary();
      set({ summary, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchProjectsProgress: async () => {
    set({ isLoading: true, error: null });
    try {
      const projectsProgress = await DashboardService.getProjectsProgress();
      set({ projectsProgress, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchFilteredTasks: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const filteredTasks = await DashboardService.filterTasks(params);
      set({ filteredTasks, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  }
}));

export default useDashboardStore;
