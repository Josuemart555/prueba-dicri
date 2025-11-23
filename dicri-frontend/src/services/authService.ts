import { api } from './api';
import type { Usuario } from '../types';

type LoginResponse = { token: string; user: Usuario };

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const { data } = await api.post('/api/auth/login', { email, password });
    return data as LoginResponse;
  },
  async me(): Promise<Usuario> {
    // Si el backend no tiene /me, podrías usar /api/usuarios/{id} guardado; aquí asumimos /me expuesto tras login
    const { data } = await api.get('/api/usuarios'); // fallback: trae listado y el backend debe retornar el actual en login, ajústalo según tu API real
    // Este es un placeholder. Idealmente exista /api/auth/me. Aquí regresamos el primero para desarrollo.
    return (Array.isArray(data) ? data[0] : data) as Usuario;
  },
};
