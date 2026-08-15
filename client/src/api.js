import axios from 'axios';

// Keeps all API requests pointed at one configurable backend URL.
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' });
// Adds the saved JWT to every protected API request automatically.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('expense_tracker_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
export default api;
