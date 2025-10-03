// src/service/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true, // Se estiver usando cookies/sessão
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor para adicionar token às requisições (opcional)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;