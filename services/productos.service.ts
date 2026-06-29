import { fetchAPI } from "./api.config";
import { mapProductoToFrontend } from "./mappers";
import { Producto, PaginatedResponse } from "@/types";

export const productosService = {
  getAll: (): Promise<Producto[]> => fetchAPI('/productos').then((list: any[]) => list.map(mapProductoToFrontend)),
  getPaged: (
    page: number,
    pageSize: number,
    search?: string,
    tipo?: string,
    disponible?: string,
    proveedorId?: string
  ): Promise<PaginatedResponse<Producto>> => {
    let url = `/productos/paged?pageNumber=${page}&pageSize=${pageSize}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (tipo && tipo !== 'todos') url += `&tipo=${tipo}`;
    if (disponible && disponible !== 'todos') {
      url += `&disponible=${disponible === 'disponible' ? 'true' : 'false'}`;
    }
    if (proveedorId) url += `&proveedorId=${proveedorId}`;
    return fetchAPI(url).then((res: any) => ({
      ...res,
      data: (res.data || []).map(mapProductoToFrontend)
    }));
  },
  getById: (id: string): Promise<Producto> => fetchAPI(`/productos/${id}`).then(mapProductoToFrontend),
  create: (data: Partial<Producto>): Promise<Producto> => fetchAPI('/productos', { method: 'POST', body: JSON.stringify(data) }).then(mapProductoToFrontend),
  update: (id: string, data: Partial<Producto>): Promise<Producto> => fetchAPI(`/productos/${id}`, { method: 'PATCH', body: JSON.stringify(data) }).then(mapProductoToFrontend),
  delete: (id: string): Promise<void> => fetchAPI(`/productos/${id}`, { method: 'DELETE' }),
};
