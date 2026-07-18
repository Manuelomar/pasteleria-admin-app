import { fetchAPI } from './api.config';
import { Categoria } from '@/types';

export const categoriasService = {
  getAll: async (): Promise<Categoria[]> => {
    return fetchAPI('/categorias');
  },

  create: async (data: { nombre: string; tipo: 'dulce' | 'salado' | 'bebida' }): Promise<Categoria> => {
    return fetchAPI('/categorias', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
