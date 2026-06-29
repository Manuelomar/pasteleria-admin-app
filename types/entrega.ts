import { Producto } from "./producto"
import { Usuario } from "./usuario"

export type EstadoEntrega = "en_espera" | "entregada"
export type EstadoPagoEntrega = "pendiente_pago" | "pagado"

export interface EntregaItem {
  id: string
  entregaId: string
  productoId: string
  cantidad: number
  precioCosto: number
  producto?: Producto
}

export interface Entrega {
  id: string
  proveedorId: string
  proveedor?: Usuario
  items: EntregaItem[]
  estadoEntrega: EstadoEntrega
  estadoPago: EstadoPagoEntrega
  fechaPrevista: string
  fechaReal: string | null
  totalCosto: number
  agregadoAlStock: boolean
  createdAt: string
  updatedAt: string
}
