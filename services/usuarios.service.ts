import { fetchAPI } from "./api.config";
import { mapUsuarioToFrontend, mapUsuarioToBackend } from "./mappers";
import { Usuario, PaginatedResponse } from "@/types";

export const usuariosService = {
  getAll: (): Promise<Usuario[]> => fetchAPI('/users').then((users: any[]) => users.map(mapUsuarioToFrontend)),
  getPaged: (
    page: number,
    pageSize: number,
    search?: string,
    role?: string,
    activo?: string
  ): Promise<PaginatedResponse<Usuario>> => {
    let url = `/users/paged?pageNumber=${page}&pageSize=${pageSize}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (role && role !== 'todos') url += `&role=${role}`;
    if (activo && activo !== 'todos') {
      url += `&activo=${activo === 'activo' ? 'true' : 'false'}`;
    }
    return fetchAPI(url).then((res: any) => ({
      ...res,
      data: (res.data || []).map(mapUsuarioToFrontend)
    }));
  },
  getById: (id: string): Promise<Usuario> => fetchAPI(`/users/${id}`).then(mapUsuarioToFrontend),
  create: (data: Partial<Usuario>): Promise<Usuario> => fetchAPI('/users', { method: 'POST', body: JSON.stringify(mapUsuarioToBackend(data)) }).then(mapUsuarioToFrontend),
  update: (id: string, data: Partial<Usuario>): Promise<Usuario> => fetchAPI(`/users/${id}`, { method: 'PUT', body: JSON.stringify(mapUsuarioToBackend(data)) }).then(mapUsuarioToFrontend),
  delete: (id: string): Promise<void> => fetchAPI(`/users/${id}`, { method: 'DELETE' }),
  enableMaterials: (id: string): Promise<Usuario> => fetchAPI(`/users/${id}/enable-materials`, { method: 'PATCH' }).then(mapUsuarioToFrontend),
};
