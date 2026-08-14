import { fetchAPI, fetchPublicAPI } from './api.config'
import type { Solicitud, EstadoSolicitud } from '@/types/solicitud'

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

  async getPaged(page: number, limit: number, tipo?: 'bizcocho' | 'combo') {
    let url = `/solicitudes/paged?page=${page}&limit=${limit}`;
    if (tipo) {
      url += `&tipo=${tipo}`;
    }
    return await fetchAPI(url) as Promise<{ items: Solicitud[], total: number, page: number, pageSize: number, totalPages: number }>;
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
