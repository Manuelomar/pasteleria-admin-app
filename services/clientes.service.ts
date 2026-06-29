import { fetchAPI } from "./api.config";
import { mapClienteToFrontend } from "./mappers";
import { Cliente } from "@/types";

export const clientesService = {
  getAll: (): Promise<Cliente[]> => fetchAPI('/clientes').then((list: any[]) => list.map(mapClienteToFrontend)),
  getById: (id: string): Promise<Cliente> => fetchAPI(`/clientes/${id}`).then(mapClienteToFrontend),
  create: (data: Partial<Cliente>): Promise<Cliente> => fetchAPI('/clientes', { method: 'POST', body: JSON.stringify(data) }).then(mapClienteToFrontend),
  update: (id: string, data: Partial<Cliente>): Promise<Cliente> => fetchAPI(`/clientes/${id}`, { method: 'PUT', body: JSON.stringify(data) }).then(mapClienteToFrontend),
  delete: (id: string): Promise<void> => fetchAPI(`/clientes/${id}`, { method: 'DELETE' }),
};
