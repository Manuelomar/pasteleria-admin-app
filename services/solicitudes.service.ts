import { fetchAPI, fetchPublicAPI } from './api.config'
import type { Solicitud, EstadoSolicitud } from '@/types/solicitud'
import { PaginatedResponse } from '@/types'

class SolicitudesService {
  async createBizcocho(formData: FormData) {
    return await fetchPublicAPI('/solicitudes/bizcocho', {
      method: 'POST',
      body: formData,
    })
  }

  async createCombo(formData: FormData) {
    return await fetchPublicAPI('/solicitudes/combo', {
      method: 'POST',
      body: formData,
    })
  }

  async getAll(tipo?: 'bizcocho' | 'combo') {
    const url = tipo ? `/solicitudes?tipo=${tipo}` : '/solicitudes'
    return await fetchAPI(url) as Promise<Solicitud[]>
  }

  async getPaged(pageNumber: number, pageSize: number, tipo?: 'bizcocho' | 'combo'): Promise<PaginatedResponse<Solicitud>> {
    let url = `/solicitudes/paged?pageNumber=${pageNumber}&pageSize=${pageSize}`;
    if (tipo) {
      url += `&tipo=${tipo}`;
    }
    const res = await fetchAPI(url) as any;
    return {
      ...res,
      data: res.items || res.data || []
    };
  }

  async getById(id: string) {
    return await fetchAPI(`/solicitudes/${id}`) as Promise<Solicitud>
  }

  async updateEstado(id: string, estado: EstadoSolicitud) {
    return await fetchAPI(`/solicitudes/${id}/estado`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ estado }),
    }) as Promise<Solicitud>
  }

  async updateConfiguracion(id: string, configuracion: any) {
    return await fetchAPI(`/solicitudes/${id}/configuracion`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ configuracion }),
    }) as Promise<Solicitud>
  }

  async delete(id: string) {
    return await fetchAPI(`/solicitudes/${id}`, {
      method: 'DELETE',
    })
  }
}

export const solicitudesService = new SolicitudesService()
