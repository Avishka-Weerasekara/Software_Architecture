import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
  (config) => {
    // Do not attach token for login or register endpoints
    if (config.url.includes('/auth/login') || config.url.includes('/auth/register')) {
      return config;
    }

    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
