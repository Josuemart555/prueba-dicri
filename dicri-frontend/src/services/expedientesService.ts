import { api } from './api';
import type { Expediente } from '../types';

export const expedientesService = {
  async list(params?: { estado?: string; fechaInicio?: string; fechaFin?: string }) {
    const { data } = await api.get('/api/expedientes', { params });
    return data as Expediente[];
  },
  async create(payload: { numero: string; descripcion?: string; fechaRegistro: string }) {
    const { data } = await api.post('/api/expedientes', payload);
    return data as Expediente;
  },
  async aprobar(id: number) {
    const { data } = await api.post(`/api/expedientes/${id}/aprobar`);
    return data;
  },
  async rechazar(id: number, justificacion: string) {
    const { data } = await api.post(`/api/expedientes/${id}/rechazar`, { justificacion });
    return data;
  },
};
