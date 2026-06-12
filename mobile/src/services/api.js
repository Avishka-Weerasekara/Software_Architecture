import axios from 'axios';
import { API_BASE_URL } from './config';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = 'Bearer ' + token;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

export const apiService = {
  login: (payload) => api.post('/auth/login', payload),
  register: (payload) => api.post('/auth/register', payload),
  getUserFines: () => api.get('/user/fines'),
  getMyPayments: () => api.get('/payment/me'),
  initiatePayment: (payload) => api.post('/payment/initiate', payload),
  getPaymentStatusBySession: (sessionId) => api.get(`/payment/session/${encodeURIComponent(sessionId)}`),
  getAdminDashboard: () => api.get('/admin/dashboard'),
  getAdminMonitoring: () => api.get('/admin/monitoring'),
  issueFine: (payload) => api.post('/admin/fines', payload),
};

export default api;