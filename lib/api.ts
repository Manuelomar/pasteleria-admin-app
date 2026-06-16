import { Producto, Cliente, Venta, Movimiento, Usuario, PaginatedResponse } from './data';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  let token = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('token');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    if (res.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    throw new Error(`API Error: ${res.statusText}`);
  }
  
  // Si no hay contenido, retorna null
  if (res.status === 204) return null;
  
  const json = await res.json();
  // El backend NestJS envuelve las respuestas en { success, status, message, data }
  if (json && json.success !== undefined && json.data !== undefined) {
    return json.data;
  }
  return json;
}

const mapUsuarioToFrontend = (u: any): Usuario => {
  if (!u) return u;
  return {
    id: u.id,
    nombre: u.name || u.username || '',
    correo: u.username || '',
    rol: u.role || 'vendedor',
    activo: u.activo ?? true,
    ultimoAcceso: u.createdAt || new Date().toISOString(),
  };
};

const mapUsuarioToBackend = (u: any): any => {
  const result: any = { ...u };
  if (u.nombre) result.name = u.nombre;
  if (u.correo) result.username = u.correo;
  if (u.rol) result.role = u.rol;
  return result;
};

const mapProductoToFrontend = (p: any): Producto => {
  if (!p) return p;
  return {
    ...p,
    precio: Number(p.precio || 0),
  };
};

const mapClienteToFrontend = (c: any): Cliente => {
  if (!c) return c;
  return {
    ...c,
    balance: Number(c.balance || 0),
    totalComprado: Number(c.totalComprado || 0),
    totalPagado: Number(c.totalPagado || 0),
  };
};

const mapMovimientoToFrontend = (m: any): Movimiento => {
  if (!m) return m;
  return {
    ...m,
    monto: Number(m.monto || 0),
    balanceRestante: Number(m.balanceRestante || 0),
  };
};

const mapVentaToFrontend = (v: any): Venta => {
  if (!v) return v;
  return {
    ...v,
    fecha: v.fecha || v.createdAt || new Date().toISOString(),
    subtotal: Number(v.subtotal || 0),
    descuento: Number(v.descuento || 0),
    impuesto: Number(v.impuesto || 0),
    total: Number(v.total || 0),
    montoPagado: Number(v.montoPagado || 0),
    balance: Number(v.balance || 0),
    items: (v.items || []).map((item: any) => ({
      ...item,
      precio: Number(item.precio || 0),
    })),
  };
};

export const api = {
  auth: {
    login: (data: any): Promise<{ access_token: string }> => fetchAPI('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  },
  productos: {
    getAll: (): Promise<Producto[]> => fetchAPI('/productos').then((list: any[]) => list.map(mapProductoToFrontend)),
    getPaged: (
      page: number,
      pageSize: number,
      search?: string,
      tipo?: string,
      disponible?: string
    ): Promise<PaginatedResponse<Producto>> => {
      let url = `/productos/paged?pageNumber=${page}&pageSize=${pageSize}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (tipo && tipo !== 'todos') url += `&tipo=${tipo}`;
      if (disponible && disponible !== 'todos') {
        url += `&disponible=${disponible === 'disponible' ? 'true' : 'false'}`;
      }
      return fetchAPI(url).then((res: any) => ({
        ...res,
        data: (res.data || []).map(mapProductoToFrontend)
      }));
    },
    getById: (id: string): Promise<Producto> => fetchAPI(`/productos/${id}`).then(mapProductoToFrontend),
    create: (data: Partial<Producto>): Promise<Producto> => fetchAPI('/productos', { method: 'POST', body: JSON.stringify(data) }).then(mapProductoToFrontend),
    update: (id: string, data: Partial<Producto>): Promise<Producto> => fetchAPI(`/productos/${id}`, { method: 'PATCH', body: JSON.stringify(data) }).then(mapProductoToFrontend),
    delete: (id: string): Promise<void> => fetchAPI(`/productos/${id}`, { method: 'DELETE' }),
  },
  clientes: {
    getAll: (): Promise<Cliente[]> => fetchAPI('/clientes').then((list: any[]) => list.map(mapClienteToFrontend)),
    getById: (id: string): Promise<Cliente> => fetchAPI(`/clientes/${id}`).then(mapClienteToFrontend),
    create: (data: Partial<Cliente>): Promise<Cliente> => fetchAPI('/clientes', { method: 'POST', body: JSON.stringify(data) }).then(mapClienteToFrontend),
    update: (id: string, data: Partial<Cliente>): Promise<Cliente> => fetchAPI(`/clientes/${id}`, { method: 'PUT', body: JSON.stringify(data) }).then(mapClienteToFrontend),
    delete: (id: string): Promise<void> => fetchAPI(`/clientes/${id}`, { method: 'DELETE' }),
  },
  ventas: {
    getAll: (): Promise<Venta[]> => fetchAPI('/ventas').then((list: any[]) => list.map(mapVentaToFrontend)),
    getPaged: (
      page: number,
      pageSize: number,
      fecha?: string
    ): Promise<PaginatedResponse<Venta>> => {
      let url = `/ventas/paged?pageNumber=${page}&pageSize=${pageSize}`;
      if (fecha) url += `&fecha=${fecha}`;
      return fetchAPI(url).then((res: any) => ({
        ...res,
        data: (res.data || []).map(mapVentaToFrontend)
      }));
    },
    getResumenCaja: (fecha: string): Promise<{ efectivo: number, tarjeta: number, transferencia: number, total: number, cantidad: number }> => 
      fetchAPI(`/ventas/resumen-caja?fecha=${fecha}`),
    getReporteHistorico: (): Promise<{ total: number, cantidad: number }> => 
      fetchAPI('/ventas/reporte-historico'),
    getTopProductos: (page: number, pageSize: number): Promise<PaginatedResponse<{ nombre: string, productoId: string, cantidad: number, total: number }>> => 
      fetchAPI(`/ventas/top-productos?pageNumber=${page}&pageSize=${pageSize}`),
    getById: (id: string): Promise<Venta> => fetchAPI(`/ventas/${id}`).then(mapVentaToFrontend),
    create: async (data: Partial<Venta>): Promise<{ data: Venta, message: string }> => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_URL}/ventas`, { method: 'POST', body: JSON.stringify(data), headers });
      if (!res.ok) {
        if (res.status === 401 && typeof window !== 'undefined') {
          localStorage.removeItem('token');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
        throw new Error(`API Error: ${res.statusText}`);
      }
      const json = await res.json();
      return { data: mapVentaToFrontend(json.data), message: json.message };
    },
    update: (id: string, data: Partial<Venta>): Promise<Venta> => fetchAPI(`/ventas/${id}`, { method: 'PUT', body: JSON.stringify(data) }).then(mapVentaToFrontend),
    delete: (id: string): Promise<void> => fetchAPI(`/ventas/${id}`, { method: 'DELETE' }),
  },
  movimientos: {
    getAll: (): Promise<Movimiento[]> => fetchAPI('/movimientos').then((list: any[]) => list.map(mapMovimientoToFrontend)),
    getById: (id: string): Promise<Movimiento> => fetchAPI(`/movimientos/${id}`).then(mapMovimientoToFrontend),
    create: (data: Partial<Movimiento>): Promise<Movimiento> => fetchAPI('/movimientos', { method: 'POST', body: JSON.stringify(data) }).then(mapMovimientoToFrontend),
    update: (id: string, data: Partial<Movimiento>): Promise<Movimiento> => fetchAPI(`/movimientos/${id}`, { method: 'PUT', body: JSON.stringify(data) }).then(mapMovimientoToFrontend),
    delete: (id: string): Promise<void> => fetchAPI(`/movimientos/${id}`, { method: 'DELETE' }),
  },
  usuarios: {
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
  }
};
