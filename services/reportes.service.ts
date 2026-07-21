import { API_URL } from './api.config';

export const reportesService = {
  getReporteProveedor: async (filtros: {
    fechaInicio?: string;
    fechaFin?: string;
    pagoPendiente?: boolean;
    pagoPagado?: boolean;
  }) => {
    const params = new URLSearchParams();
    if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
    if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin);
    if (filtros.pagoPendiente) params.append('pagoPendiente', 'true');
    if (filtros.pagoPagado) params.append('pagoPagado', 'true');

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

  getReporteVentas: async (filtros: {
    fechaInicio?: string;
    fechaFin?: string;
    metodosPago?: string[];
  }) => {
    const params = new URLSearchParams();
    if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
    if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin);
    if (filtros.metodosPago && filtros.metodosPago.length > 0) {
      params.append('metodosPago', filtros.metodosPago.join(','));
    }

    let token = null;
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('token');
    }

    const response = await fetch(`${API_URL}/reportes/ventas?${params.toString()}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      throw new Error('Error al generar el reporte de ventas');
    }

    return response.text(); // Devuelve HTML
  },

  getReporteGanancias: async (filtros: {
    fechaInicio?: string;
    fechaFin?: string;
  }) => {
    const params = new URLSearchParams();
    if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
    if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin);

    let token = null;
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('token');
    }

    const response = await fetch(`${API_URL}/reportes/ganancias?${params.toString()}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      throw new Error('Error al generar el reporte de ganancias');
    }

    return response.text(); // Devuelve HTML
  },
};
