import axios from 'axios';

const rawBase =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? 'https://edulead-crm-lksk.onrender.com' : '');
const apiBase = rawBase
  ? (rawBase.endsWith('/api') ? rawBase : `${rawBase.replace(/\/$/, '')}/api`)
  : '/api';

const api = axios.create({
  baseURL: apiBase,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('edulead_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauthorized/token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('edulead_token');
        localStorage.removeItem('edulead_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
