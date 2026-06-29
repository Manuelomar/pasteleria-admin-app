import { API_URL } from './api.config';

export const reportesService = {
  getReporteProveedor: async (filtros: {
    fechaInicio?: string;
    fechaFin?: string;
    entregado?: boolean;
    noPagado?: boolean;
    finalizado?: boolean;
  }) => {
    const params = new URLSearchParams();
    if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
    if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin);
    if (filtros.entregado) params.append('entregado', 'true');
    if (filtros.noPagado) params.append('noPagado', 'true');
    if (filtros.finalizado) params.append('finalizado', 'true');

    let token = null;
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('token');
    }

    const response = await fetch(`${API_URL}/reportes/proveedor?${params.toString()}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      throw new Error('Error al generar el reporte');
    }

    return response.text(); // Devuelve HTML
  },
};
