import { create } from 'zustand';
import { AdminService } from '../services/admin.service';

const useTaskStore = create((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,

  fetchTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const tasks = await AdminService.getAllTasks();
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
    // Optimistic update
    const previousTasks = get().tasks;
    set((state) => ({
      tasks: state.tasks.map((t) => t.id === id ? { ...t, taskStatus: status } : t),
    }));
    
    try {
      await AdminService.updateTaskStatus(id, status);
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
