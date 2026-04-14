import axios from 'axios';
import { useAuthStore } from '@/store/auth.store';

const api = axios.create({
  // Chamadas diretas para as API Routes do mesmo projeto Next.js
  baseURL: typeof window !== 'undefined' ? '/api' : `${process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'}/api`,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('stockpro_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      console.warn('[API] Recebido 401. Resetando estado de autenticação...');
      // Usar o método reset do Zustand é mais limpo que apagar o localStorage manualmente
      useAuthStore.getState().clearAuth();
      
      // Não damos o window.location.href aqui para evitar o loop infinito.
      // O DashboardLayout vai detectar que isAuthenticated mudou para false e redirecionar pelo router do Next.
    }
    return Promise.reject(err);
  },
);

export default api;
