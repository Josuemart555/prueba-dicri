import { api } from './api';
import type { Expediente } from '../types';

export const expedientesService = {
  async get(id: number) {
    const { data } = await api.get(`/api/expedientes/${id}`);
    return data as Expediente;
  },
  async getRechazos(id: number) {
    const { data } = await api.get(`/api/expedientes/${id}/rechazos`);
    return data as Array<{
      RechazoId?: number;
      ExpedienteId?: number;
      UsuarioId?: number;
      Usuario?: string;
      Justificacion?: string;
      Fecha?: string;
      rechazoId?: number;
      expedienteId?: number;
      usuarioId?: number;
      usuario?: string;
      justificacion?: string;
      fecha?: string;
    }>;
  },
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
  async cambiarEstado(id: number, estado: string) {
    const { data } = await api.post(`/api/expedientes/${id}/estado`, { estado });
    return data;
  },
};
