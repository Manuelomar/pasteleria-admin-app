import { fetchAPI } from "./api.config";
import { mapMovimientoToFrontend } from "./mappers";
import { Movimiento } from "@/types";

export const movimientosService = {
  getAll: (): Promise<Movimiento[]> => fetchAPI('/movimientos').then((list: any[]) => list.map(mapMovimientoToFrontend)),
  getById: (id: string): Promise<Movimiento> => fetchAPI(`/movimientos/${id}`).then(mapMovimientoToFrontend),
  create: (data: Partial<Movimiento>): Promise<Movimiento> => fetchAPI('/movimientos', { method: 'POST', body: JSON.stringify(data) }).then(mapMovimientoToFrontend),
  update: (id: string, data: Partial<Movimiento>): Promise<Movimiento> => fetchAPI(`/movimientos/${id}`, { method: 'PUT', body: JSON.stringify(data) }).then(mapMovimientoToFrontend),
  delete: (id: string): Promise<void> => fetchAPI(`/movimientos/${id}`, { method: 'DELETE' }),
};
