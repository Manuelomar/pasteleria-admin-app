import { fetchAPI } from "./api.config";
import { Entrega } from "@/types";

export const entregasService = {
  getAll: (filtro?: string): Promise<Entrega[]> => fetchAPI(`/entregas${filtro && filtro !== 'todos' ? `?filtro=${filtro}` : ''}`),
  create: (data: Partial<Entrega>): Promise<Entrega> => fetchAPI('/entregas', { method: 'POST', body: JSON.stringify(data) }),
  updateEstadoEntrega: (id: string, estado: string): Promise<Entrega> => fetchAPI(`/entregas/${id}/estado-entrega`, { method: 'PATCH', body: JSON.stringify({ estado }) }),
  updateEstadoPago: (id: string, estado: string): Promise<Entrega> => fetchAPI(`/entregas/${id}/estado-pago`, { method: 'PATCH', body: JSON.stringify({ estado }) }),
  addToStock: (id: string): Promise<Entrega> => fetchAPI(`/entregas/${id}/add-to-stock`, { method: 'POST' }),
};
