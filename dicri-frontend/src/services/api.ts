import axios from 'axios';
import { env } from '../config/env';
import { storage } from '../utils/storage';

export const api = axios.create({
  baseURL: env.apiUrl,
});

api.interceptors.request.use((config) => {
  const token = storage.getToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    // Simple normalized error
    const message = error?.response?.data?.message || error.message || 'Error de red';
    return Promise.reject(new Error(message));
  }
);
