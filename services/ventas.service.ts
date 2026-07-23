import { fetchAPI, API_URL } from "./api.config";
import { mapVentaToFrontend } from "./mappers";
import { Venta, PaginatedResponse } from "@/types";

export const ventasService = {
  getAll: (): Promise<Venta[]> => fetchAPI('/ventas').then((list: any[]) => list.map(mapVentaToFrontend)),
  getPendientes: (): Promise<Venta[]> => fetchAPI('/ventas/pendientes').then((list: any[]) => list.map(mapVentaToFrontend)),
  getPaged: (
    page: number,
    pageSize: number,
    fecha?: string
  ): Promise<PaginatedResponse<Venta>> => {
    let url = `/ventas/paged?pageNumber=${page}&pageSize=${pageSize}`;
    if (fecha) url += `&fecha=${fecha}`;
    return fetchAPI(url).then((res: any) => ({
      ...res,
      data: (res.data || []).map(mapVentaToFrontend)
    }));
  },
  getResumenCaja: (fecha: string): Promise<{ efectivo: number, tarjeta: number, transferencia: number, total: number, cantidad: number }> => 
    fetchAPI(`/ventas/resumen-caja?fecha=${fecha}`),
  getReporteHistorico: (): Promise<{ total: number, cantidad: number }> => 
    fetchAPI('/ventas/reporte-historico'),
  getHistorialProductos: (desde?: string, hasta?: string, productoId?: string, page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<any>> => {
    let url = `/ventas/historial-productos?`;
    const params = new URLSearchParams();
    if (desde) params.append('desde', desde);
    if (hasta) params.append('hasta', hasta);
    if (productoId && productoId !== 'all') params.append('productoId', productoId);
    params.append('pageNumber', page.toString());
    params.append('pageSize', pageSize.toString());
    return fetchAPI(url + params.toString());
  },
  getTopProductos: (page: number, pageSize: number): Promise<PaginatedResponse<{ nombre: string, productoId: string, cantidad: number, total: number }>> => 
    fetchAPI(`/ventas/top-productos?pageNumber=${page}&pageSize=${pageSize}`),
  getById: (id: string): Promise<Venta> => fetchAPI(`/ventas/${id}`).then(mapVentaToFrontend),
  create: async (data: Partial<Venta>): Promise<{ data: Venta, message: string }> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_URL}/ventas`, { method: 'POST', body: JSON.stringify(data), headers });
    if (!res.ok) {
      if (res.status === 401 && typeof window !== 'undefined') {
        localStorage.removeItem('token');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      throw new Error(`API Error: ${res.statusText}`);
    }
    const json = await res.json();
    return { data: mapVentaToFrontend(json.data), message: json.message };
  },
  update: (id: string, data: Partial<Venta>): Promise<Venta> => fetchAPI(`/ventas/${id}`, { method: 'PUT', body: JSON.stringify(data) }).then(mapVentaToFrontend),
  delete: (id: string): Promise<void> => fetchAPI(`/ventas/${id}`, { method: 'DELETE' }),
};
