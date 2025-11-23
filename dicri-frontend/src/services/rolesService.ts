import { api } from './api';
import type { Permiso, Rol } from '../types';

export const rolesService = {
  async list() {
    const { data } = await api.get('/api/roles');
    return data as Rol[];
  },
  async get(id: number) {
    const { data } = await api.get(`/api/roles/${id}`);
    return data as Rol;
  },
  async create(nombre: string) {
    const { data } = await api.post('/api/roles', { nombre });
    return data as Rol;
  },
  async update(id: number, nombre: string) {
    const { data } = await api.put(`/api/roles/${id}`, { nombre });
    return data as Rol;
  },
  async remove(id: number) {
    await api.delete(`/api/roles/${id}`);
  },
  async listPermisos(id: number) {
    const { data } = await api.get(`/api/roles/${id}/permisos`);
    return data as Permiso[];
  },
  async addPermiso(id: number, permisoId: number) {
    const { data } = await api.post(`/api/roles/${id}/permisos`, { permisoId });
    return data;
  },
  async removePermiso(id: number, permisoId: number) {
    await api.delete(`/api/roles/${id}/permisos/${permisoId}`);
  },
};
