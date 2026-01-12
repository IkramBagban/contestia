import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
});

// Request interceptor removed as we use cookies
/*
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
*/

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // localStorage.removeItem('token'); // No need to remove local storage
      // window.location.href = '/login'; 
      // Better to handle redirect in UI or use a cleaner navigation method
    }
    return Promise.reject(error);
  }
);
