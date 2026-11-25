import type { Producto } from "./producto"

export type MetodoPago = "efectivo" | "tarjeta" | "transferencia" | "uberEats" | "pedidosYa"
export type EstadoPago = "pagado" | "pendiente" | "parcial"

export interface VentaItem {
  productoId: string
  nombre: string
  precio: number
  precioUber?: number
  precioPedidosYa?: number
  cantidad: number
  precioCosto?: number
}

export interface Venta {
  id: string
  factura: string
  clienteId: string | null
  clienteNombre: string
  sucursalId?: string | null
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

export interface MetricSummary {
  ventas: number
  ganancia: number
  itbis: number
  sinItbis: number
  ordenes: number
}

export interface DashboardMetrics {
  stats: {
    hoy: MetricSummary | null
    semana: MetricSummary | null
    mes: MetricSummary | null
    anio: MetricSummary | null
    custom: MetricSummary | null
  }
  ventasSemanales: { dia: string; ventas: number }[]
  ventasMensuales: { mes: string; ventas: number; subtotal: number; impuesto: number }[]
  ventasPorCategoria: { categoria: string; valor: number; fill: string }[]
  metodosPago: { metodo: string; valor: number; fill: string }[]
  masVendidos: Producto[]
  productosDisp: number
  porCobrar: number
  ventasRecientes: (Venta & { cliente?: { nombre: string } })[]
}
