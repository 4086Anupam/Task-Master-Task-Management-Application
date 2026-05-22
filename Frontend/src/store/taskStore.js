import { create } from 'zustand';
import { AdminService } from '../services/admin.service';
import useAuthStore from './authStore';
import { DashboardService } from '../services/dashboard.service';

const useTaskStore = create((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,

  fetchTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const currentUser = useAuthStore.getState().user;
      const isAdmin = currentUser?.role === 'ADMIN';

      const tasks = isAdmin
        ? await AdminService.getAllTasks()
        : await DashboardService.filterTasks({});

      set({ tasks, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  createTask: async (taskData) => {
    set({ isLoading: true, error: null });
    try {
      const newTask = await AdminService.createTask(taskData);
      set((state) => ({ tasks: [...state.tasks, newTask], isLoading: false }));
      return newTask;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateTask: async (id, taskData) => {
    set({ isLoading: true, error: null });
    try {
      const updatedTask = await AdminService.updateTask(id, taskData);
      set((state) => ({
        tasks: state.tasks.map((t) => t.id === id ? updatedTask : t),
        isLoading: false
      }));
      return updatedTask;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateTaskStatus: async (id, status) => {
    const currentUser = useAuthStore.getState().user;
    const isAdmin = currentUser?.role === 'ADMIN';

    // Optimistic update
    const previousTasks = get().tasks;
    set((state) => ({
      tasks: state.tasks.map((t) => t.id === id ? { ...t, taskStatus: status } : t),
    }));
    
    try {
      if (isAdmin) {
        await AdminService.updateTaskStatus(id, status);
      } else {
        await AdminService.updateEmployeeTaskStatus(id, status);
      }
    } catch (error) {
      // Revert on failure
      set({ tasks: previousTasks, error: error.message });
      throw error;
    }
  },

  deleteTask: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await AdminService.deleteTask(id);
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id),
        isLoading: false
      }));
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
}));

export default useTaskStore;
