import { fetchAPI, fetchPublicAPI } from "./api.config";
import { mapProductoToFrontend } from "./mappers";
import { Producto, PaginatedResponse } from "@/types";

export const productosService = {
  getAll: (disponible?: boolean, sucursalId?: string): Promise<Producto[]> => {
    const params = new URLSearchParams();
    if (disponible !== undefined) params.append('disponible', String(disponible));
    if (sucursalId && sucursalId !== 'todas') params.append('sucursalId', sucursalId);
    const queryString = params.toString();
    return fetchAPI(queryString ? `/productos?${queryString}` : '/productos').then((list: any[]) => list.map(mapProductoToFrontend));
  },
  getPaged: (
    page: number,
    pageSize: number,
    search?: string,
    tipo?: string,
    disponible?: string,
    proveedorId?: string,
    sucursalId?: string
  ): Promise<PaginatedResponse<Producto>> => {
    let url = `/productos/paged?pageNumber=${page}&pageSize=${pageSize}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (tipo && tipo !== 'todos') url += `&tipo=${tipo}`;
    if (disponible && disponible !== 'todos') {
      url += `&disponible=${disponible === 'disponible' ? 'true' : 'false'}`;
    }
    if (proveedorId) url += `&proveedorId=${proveedorId}`;
    if (sucursalId && sucursalId !== 'todas') url += `&sucursalId=${sucursalId}`;
    return fetchAPI(url).then((res: any) => ({
      ...res,
      data: (res.data || []).map(mapProductoToFrontend)
    }));
  },
  getPublicPaged: (
    page: number,
    pageSize: number,
    search?: string,
    tipo?: string,
    disponible?: string,
    sucursalId?: string
  ): Promise<PaginatedResponse<Producto>> => {
    let url = `/productos/public/paged?pageNumber=${page}&pageSize=${pageSize}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (tipo && tipo !== 'todos') url += `&tipo=${tipo}`;
    if (disponible && disponible !== 'todos') {
      url += `&disponible=${disponible === 'disponible' || disponible === 'true' ? 'true' : 'false'}`;
    }
    if (sucursalId && sucursalId !== 'todas') url += `&sucursalId=${sucursalId}`;
    return fetchPublicAPI(url).then((res: any) => ({
      ...res,
      data: (res.data || []).map(mapProductoToFrontend)
    }));
  },
  getPublicAll: (sucursalId?: string): Promise<Producto[]> => {
    const query = sucursalId && sucursalId !== 'todas' ? `?sucursalId=${sucursalId}` : '';
    return fetchPublicAPI(`/productos/public/all${query}`).then((list: any[]) => list.map(mapProductoToFrontend));
  },
  getById: (id: string): Promise<Producto> => fetchAPI(`/productos/${id}`).then(mapProductoToFrontend),
  getUniqueNames: (): Promise<Partial<Producto>[]> => fetchAPI('/productos/unique'),
  create: (data: Partial<Producto>): Promise<Producto> => fetchAPI('/productos', { method: 'POST', body: JSON.stringify(data) }).then(mapProductoToFrontend),
  update: (id: string, data: Partial<Producto>): Promise<Producto> => fetchAPI(`/productos/${id}`, { method: 'PATCH', body: JSON.stringify(data) }).then(mapProductoToFrontend),
  delete: (id: string): Promise<void> => fetchAPI(`/productos/${id}`, { method: 'DELETE' }),
  uploadImage: (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    return fetchAPI('/productos/upload', { method: 'POST', body: formData });
  },
};
