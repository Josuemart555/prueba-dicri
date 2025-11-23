import { api } from './api';
import type { Permiso } from '../types';

export const permisosService = {
  async list() {
    const { data } = await api.get('/api/permisos');
    return data as Permiso[];
  },
  async get(id: number) {
    const { data } = await api.get(`/api/permisos/${id}`);
    return data as Permiso;
  },
  async create(nombre: string) {
    const { data } = await api.post('/api/permisos', { nombre });
    return data as Permiso;
  },
  async update(id: number, nombre: string) {
    const { data } = await api.put(`/api/permisos/${id}`, { nombre });
    return data as Permiso;
  },
  async remove(id: number) {
    await api.delete(`/api/permisos/${id}`);
  },
};
