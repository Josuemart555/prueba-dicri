import { api } from './api';

// Tipos del nuevo contrato del backend
export type ResumenItem = {
  Estado: string;
  Total: number;
};

export type AprobadoItem = {
  ExpedienteId: number;
  Numero: string;
  Descripcion: string;
  FechaRegistro: string; // ISO
  Estado: string;
  TecnicoId: number;
  Tecnico: string;
  AprobacionFecha: string;
  AprobacionUsuarioId: number;
  AprobacionUsuario: string;
};

export type RechazadoItem = {
  ExpedienteId: number;
  Numero: string;
  Descripcion: string;
  FechaRegistro: string; // ISO
  Estado: string;
  TecnicoId: number;
  Tecnico: string;
  UltimoRechazoJustificacion: string;
  UltimoRechazoFecha: string;
  UltimoRechazoUsuarioId: number;
  UltimoRechazoUsuario: string;
};

export type ReporteResponse = {
  resumen: ResumenItem[];
  aprobados: AprobadoItem[];
  rechazados: RechazadoItem[];
};

export const reportesService = {
  // Nuevo método que consume el objeto completo { resumen, aprobados, rechazados }
  async reporte(params?: { fechaInicio?: string; fechaFin?: string }) {
    const { data } = await api.get('/api/reportes/resumen', { params });
    return data as ReporteResponse;
  },

  // Se mantiene por compatibilidad si en algún lugar se esperaba sólo un arreglo.
  // Ahora devuelve solo el resumen (si se usa).
  async resumen(params?: { fechaInicio?: string; fechaFin?: string }) {
    const { data } = await api.get('/api/reportes/resumen', { params });
    return (data?.resumen ?? []) as ResumenItem[];
  },
};
