import { create } from 'zustand';
import { AuthService } from '../services/auth.service';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const data = await AuthService.login(credentials);

      if (!data?.jwt && data?.verificationRequired) {
        localStorage.setItem('pendingOtpEmail', data.email || credentials.email);
        set({
          isLoading: false,
          error: null,
        });

        return {
          verified: false,
          email: data.email || credentials.email,
          message: 'OTP verification required',
        };
      }

      localStorage.setItem('token', data.jwt);
      const userPayload = data.user || { userId: data.userId, role: data.userRole };
      localStorage.setItem('user', JSON.stringify(userPayload));
      set({ 
        user: userPayload, 
        token: data.jwt, 
        isAuthenticated: true, 
        isLoading: false 
      });
      return { verified: true };
    } catch (error) {
      set({ error: error.response?.data?.message || 'Login failed', isLoading: false });
      return false;
    }
  },

  signup: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      await AuthService.signup(userData);
      set({ isLoading: false });
      return true;
    } catch (error) {
      set({ error: error.response?.data || 'Signup failed', isLoading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));

export default useAuthStore;
