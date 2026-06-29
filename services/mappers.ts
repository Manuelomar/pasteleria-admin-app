import { Usuario, Producto, Cliente, Movimiento, Venta } from "@/types";

export const mapUsuarioToFrontend = (u: any): Usuario => {
  if (!u) return u;
  return {
    id: u.id,
    nombre: u.name || u.username || '',
    correo: u.username || '',
    rol: (u.role === 'admin' || u.role === 'administrador') ? 'admin' : (u.role === 'proveedor' ? 'proveedor' : 'usuario'),
    activo: u.activo ?? true,
    ultimoAcceso: u.createdAt || new Date().toISOString(),
    permisos: u.permissions || {},
  };
};

export const mapUsuarioToBackend = (u: any): any => {
  const result: any = {};
  if (u.nombre !== undefined) result.name = u.nombre;
  if (u.correo !== undefined) result.username = u.correo;
  if (u.username !== undefined && !result.username) result.username = u.username;
  if (u.password !== undefined) result.password = u.password;
  if (u.rol !== undefined) result.role = u.rol;
  if (u.activo !== undefined) result.activo = u.activo;
  if (u.permisos !== undefined) result.permissions = u.permisos;
  return result;
};

export const mapProductoToFrontend = (p: any): Producto => {
  if (!p) return p;
  return {
    ...p,
    precio: Number(p.precio || 0),
  };
};

export const mapClienteToFrontend = (c: any): Cliente => {
  if (!c) return c;
  return {
    ...c,
    balance: Number(c.balance || 0),
    totalComprado: Number(c.totalComprado || 0),
    totalPagado: Number(c.totalPagado || 0),
  };
};

export const mapMovimientoToFrontend = (m: any): Movimiento => {
  if (!m) return m;
  return {
    ...m,
    monto: Number(m.monto || 0),
    balanceRestante: Number(m.balanceRestante || 0),
  };
};

export const mapVentaToFrontend = (v: any): Venta => {
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
