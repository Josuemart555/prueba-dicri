import { api } from './api';

export type ResumenEstado = {
  estado: string;
  total: number;
};

export const reportesService = {
  async resumen(params?: { fechaInicio?: string; fechaFin?: string }) {
    const { data } = await api.get('/api/reportes/resumen', { params });
    return data as ResumenEstado[];
  },
};
