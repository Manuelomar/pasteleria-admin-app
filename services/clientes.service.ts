import { fetchAPI } from "./api.config";
import { mapClienteToFrontend } from "./mappers";
import { Cliente, PaginatedResponse } from "@/types";

export const clientesService = {
  getAll: (): Promise<Cliente[]> => fetchAPI('/clientes').then((list: any[]) => list.map(mapClienteToFrontend)),
  getPaged: (page: number, limit: number, search?: string): Promise<PaginatedResponse<Cliente>> => {
    let query = `?page=${page}&limit=${limit}`;
    if (search) query += `&search=${encodeURIComponent(search)}`;
    return fetchAPI(`/clientes/paged${query}`).then((res: any) => ({
      ...res,
      data: res.items.map(mapClienteToFrontend)
    }));
  },
  getById: (id: string): Promise<Cliente> => fetchAPI(`/clientes/${id}`).then(mapClienteToFrontend),
  create: (data: Partial<Cliente>): Promise<Cliente> => fetchAPI('/clientes', { method: 'POST', body: JSON.stringify(data) }).then(mapClienteToFrontend),
  update: (id: string, data: Partial<Cliente>): Promise<Cliente> => fetchAPI(`/clientes/${id}`, { method: 'PUT', body: JSON.stringify(data) }).then(mapClienteToFrontend),
  delete: (id: string): Promise<void> => fetchAPI(`/clientes/${id}`, { method: 'DELETE' }),
};
