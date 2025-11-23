import { api } from './api';
import type { Rol, Usuario } from '../types';

export const usuariosService = {
  async list() {
    const { data } = await api.get('/api/usuarios');
    return data as Usuario[];
  },
  async get(id: number) {
    const { data } = await api.get(`/api/usuarios/${id}`);
    return data as Usuario;
  },
  async create(payload: { email: string; password: string; activo?: boolean }) {
    const { data } = await api.post('/api/usuarios', payload);
    return data as Usuario;
  },
  async update(id: number, payload: { nombre: string; email: string; activo: boolean }) {
    const { data } = await api.put(`/api/usuarios/${id}`, payload);
    return data as Usuario;
  },
  async remove(id: number) {
    await api.delete(`/api/usuarios/${id}`);
  },
  async updatePassword(id: number, password: string) {
    await api.put(`/api/usuarios/${id}/password`, { password });
  },
  async listRoles(id: number) {
    const { data } = await api.get(`/api/usuarios/${id}/roles`);
    return data as Rol[];
  },
  async addRole(id: number, rolId: number) {
    const { data } = await api.post(`/api/usuarios/${id}/roles`, { rolId });
    return data;
  },
  async removeRole(id: number, rolId: number) {
    await api.delete(`/api/usuarios/${id}/roles/${rolId}`);
  },
};
