import { fetchAPI } from './api.config';
import { Sucursal, CreateSucursalInput, UpdateSucursalInput } from '@/types';

export const sucursalesService = {
  getAll: async (includeInactivas = false): Promise<Sucursal[]> => {
    const query = includeInactivas ? '?includeInactivas=true' : '';
    return fetchAPI(`/sucursales${query}`);
  },

  getById: async (id: string): Promise<Sucursal> => {
    return fetchAPI(`/sucursales/${id}`);
  },

  create: async (data: CreateSucursalInput): Promise<Sucursal> => {
    return fetchAPI('/sucursales', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: UpdateSucursalInput): Promise<Sucursal> => {
    return fetchAPI(`/sucursales/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  toggleActiva: async (id: string): Promise<Sucursal> => {
    return fetchAPI(`/sucursales/${id}/toggle-activa`, {
      method: 'PATCH',
    });
  },

  clonarCatalogo: async (
    destinoId: string,
    sucursalOrigenId: string,
    clonarStock = false
  ): Promise<{ success: boolean; count: number; message: string }> => {
    return fetchAPI(`/sucursales/${destinoId}/clonar-catalogo`, {
      method: 'POST',
      body: JSON.stringify({ sucursalOrigenId, clonarStock }),
    });
  },
};
