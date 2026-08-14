import { fetchAPI } from "./api.config";
import { Entrega, PaginatedResponse } from "@/types";

export const entregasService = {
  getAll: (filtro?: string): Promise<Entrega[]> => fetchAPI(`/entregas${filtro && filtro !== 'todos' ? `?filtro=${filtro}` : ''}`),
  getPaged: (page: number, limit: number, filtro?: string, search?: string): Promise<PaginatedResponse<Entrega>> => {
    let query = `?page=${page}&limit=${limit}`;
    if (filtro && filtro !== 'todos') query += `&filtro=${filtro}`;
    if (search) query += `&search=${encodeURIComponent(search)}`;
    return fetchAPI(`/entregas/paged${query}`).then((res: any) => ({
      ...res,
      data: (res.data || res.items || []).map((e: any) => e)
    }));
  },
  create: (data: Partial<Entrega>): Promise<Entrega> => fetchAPI('/entregas', { method: 'POST', body: JSON.stringify(data) }),
  updateEstadoEntrega: (id: string, estado: string): Promise<Entrega> => fetchAPI(`/entregas/${id}/estado-entrega`, { method: 'PATCH', body: JSON.stringify({ estado }) }),
  updateEstadoPago: (id: string, estado: string): Promise<Entrega> => fetchAPI(`/entregas/${id}/estado-pago`, { method: 'PATCH', body: JSON.stringify({ estado }) }),
  addToStock: (id: string): Promise<Entrega> => fetchAPI(`/entregas/${id}/add-to-stock`, { method: 'POST' }),
  remove: (id: string): Promise<{ message: string }> => fetchAPI(`/entregas/${id}`, { method: 'DELETE' }),
};
