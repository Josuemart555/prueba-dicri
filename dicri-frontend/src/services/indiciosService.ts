import { api } from './api';
import type { Indicio } from '../types';

export const indiciosService = {
  async create(payload: Indicio) {
    const { data } = await api.post('/api/indicios', payload);
    return data as Indicio;
  },
};
