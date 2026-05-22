import { create } from 'zustand';
import { ProjectService } from '../services/project.service';
import { DashboardService } from '../services/dashboard.service';

const useProjectStore = create((set, get) => ({
  projects: [],
  isLoading: false,
  error: null,

  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const progress = await DashboardService.getProjectsProgress();
      const projects = progress.map(p => ({
        id: p.projectId,
        name: p.projectName,
        description: `Total tasks: ${p.totalTasks}` // Since we don't get full description
      }));
      set({ projects, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  createProject: async (projectData) => {
    set({ isLoading: true, error: null });
    try {
      const newProject = await ProjectService.createProject(projectData);
      set((state) => ({ projects: [...state.projects, newProject], isLoading: false }));
      return newProject;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateProject: async (id, projectData) => {
    set({ isLoading: true, error: null });
    try {
      const updatedProject = await ProjectService.updateProject(id, projectData);
      set((state) => ({
        projects: state.projects.map((p) => p.id === id ? updatedProject : p),
        isLoading: false
      }));
      return updatedProject;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  deleteProject: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await ProjectService.deleteProject(id);
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
        isLoading: false
      }));
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  assignMember: async (projectId, userId) => {
    set({ isLoading: true, error: null });
    try {
      await ProjectService.assignMemberToProject(projectId, userId);
      set({ isLoading: false });
      return true;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  }
}));

export default useProjectStore;
