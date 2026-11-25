import { fetchAPI } from "./api.config";
import { Entrega, CreateEntregaInput, PaginatedResponse, IngresoRapidoInput, IngresoRapidoResponse } from "@/types";

export const entregasService = {
  getAll: (filtro?: string, sucursalId?: string): Promise<Entrega[]> => {
    const params = new URLSearchParams();
    if (filtro && filtro !== 'todos') params.append('filtro', filtro);
    if (sucursalId && sucursalId !== 'todas') params.append('sucursalId', sucursalId);
    const qs = params.toString();
    return fetchAPI(qs ? `/entregas?${qs}` : '/entregas');
  },
  getPaged: (
    page: number,
    limit: number,
    filtro?: string,
    search?: string,
    proveedorId?: string,
    sucursalId?: string
  ): Promise<PaginatedResponse<Entrega>> => {
    let query = `?pageNumber=${page}&pageSize=${limit}`;
    if (filtro && filtro !== 'todos') query += `&filtro=${filtro}`;
    if (search) query += `&search=${encodeURIComponent(search)}`;
    if (proveedorId) query += `&proveedorId=${proveedorId}`;
    if (sucursalId && sucursalId !== 'todas') query += `&sucursalId=${sucursalId}`;
    return fetchAPI(`/entregas/paged${query}`).then((res: { data?: Entrega[]; items?: Entrega[]; total: number; page: number; pageSize: number; totalPages: number }) => ({
      data: res.data || res.items || [],
      total: res.total,
      page: res.page,
      pageSize: res.pageSize,
      totalPages: res.totalPages,
    }));
  },
  create: (data: CreateEntregaInput): Promise<Entrega> => fetchAPI('/entregas', { method: 'POST', body: JSON.stringify(data) }),
  updateEstadoEntrega: (id: string, estado: string): Promise<Entrega> => fetchAPI(`/entregas/${id}/estado-entrega`, { method: 'PATCH', body: JSON.stringify({ estado }) }),
  updateEstadoPago: (id: string, estado: string): Promise<Entrega> => fetchAPI(`/entregas/${id}/estado-pago`, { method: 'PATCH', body: JSON.stringify({ estado }) }),
  updateItems: (id: string, items: Array<{ id?: string; productoId: string; cantidad: number }>): Promise<Entrega> =>
    fetchAPI(`/entregas/${id}/items`, { method: 'PATCH', body: JSON.stringify({ items }) }),
  addToStock: (id: string): Promise<Entrega> => fetchAPI(`/entregas/${id}/add-to-stock`, { method: 'POST' }),
  ingresoRapido: (data: IngresoRapidoInput): Promise<IngresoRapidoResponse> =>
    fetchAPI('/entregas/ingreso-rapido', { method: 'POST', body: JSON.stringify(data) }),
  remove: (id: string): Promise<{ message: string }> => fetchAPI(`/entregas/${id}`, { method: 'DELETE' }),
};
