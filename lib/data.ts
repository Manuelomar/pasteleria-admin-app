export type Tipo = "dulce" | "salado" | "bebida"
export type Disponibilidad = "disponible" | "no-disponible"

export interface Producto {
  id: string
  nombre: string
  categoria: string
  tipo: Tipo
  precio: number
  disponible: boolean
  imagen: string
  descripcion: string
  vendidos: number
  cantidad?: number
}

export interface Cliente {
  id: string
  nombre: string
  telefono: string
  correo: string
  direccion: string
  balance: number
  ultimaCompra: string
  activo: boolean
  nota?: string
  totalComprado: number
  totalPagado: number
  ultimoPago: string
}

export type MetodoPago = "efectivo" | "tarjeta" | "transferencia"
export type EstadoPago = "pagado" | "pendiente" | "parcial"

export interface VentaItem {
  productoId: string
  nombre: string
  precio: number
  cantidad: number
}

export interface Venta {
  id: string
  factura: string
  clienteId: string | null
  clienteNombre: string
  items: VentaItem[]
  subtotal: number
  descuento: number
  impuesto: number
  total: number
  metodoPago: MetodoPago
  estadoPago: EstadoPago
  montoPagado: number
  balance: number
  cajeroId?: string | null
  fecha: string
}

export type TipoMovimiento = "venta" | "pago" | "ajuste"

export interface Movimiento {
  id: string
  clienteId: string
  fecha: string
  tipo: TipoMovimiento
  factura: string
  descripcion: string
  monto: number
  balanceRestante: number
  estado: EstadoPago
}

export type Rol = "admin" | "usuario"

export interface Usuario {
  id: string
  nombre: string
  correo: string
  rol: Rol
  activo: boolean
  ultimoAcceso: string
  permisos?: Record<string, boolean>
}

export function currency(n: number) {
  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "DOP",
    minimumFractionDigits: 2,
  }).format(n)
}

export const tipoLabel: Record<Tipo, string> = {
  dulce: "Dulce",
  salado: "Salado",
  bebida: "Bebida",
}

export const rolLabel: Record<Rol, string> = {
  admin: "Administrador",
  usuario: "Usuario",
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
