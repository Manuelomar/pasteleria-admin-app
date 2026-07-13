export type MetodoPago = "efectivo" | "tarjeta" | "transferencia" | "uberEats"
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
