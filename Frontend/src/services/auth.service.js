import api from '../lib/axios';

export const AuthService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  requestOtp: async (email) => {
    const response = await api.post(`/auth/request-otp?email=${encodeURIComponent(email)}`);
    return response.data;
  },

  verifyOtp: async (payload) => {
    const response = await api.post('/auth/verify-otp', payload);
    return response.data;
  },
  
  signup: async (userData) => {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  }
};
