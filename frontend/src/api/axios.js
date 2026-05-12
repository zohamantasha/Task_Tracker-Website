// api/axios.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000/api/',  // ✅ Check this URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('access');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;