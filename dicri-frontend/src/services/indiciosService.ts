import { api } from './api';
import type { Indicio } from '../types';

export const indiciosService = {
  async listByExpediente(expedienteId: number) {
    const { data } = await api.get('/api/indicios', { params: { expedienteId } });
    return data as Indicio[];
  },
  async get(id: number) {
    const { data } = await api.get(`/api/indicios/${id}`);
    return data as Indicio;
  },
  async create(payload: Indicio) {
    const { data } = await api.post('/api/indicios', payload);
    return data as Indicio;
  },
  async update(id: number, payload: Partial<Indicio>) {
    const { data } = await api.put(`/api/indicios/${id}` , payload);
    return data as Indicio;
  },
  async remove(id: number) {
    const { data } = await api.delete(`/api/indicios/${id}`);
    return data;
  },
};
