import { Producto } from "./producto"
import { Usuario } from "./usuario"
import { Sucursal } from "./sucursal"

export type EstadoEntrega = "en_espera" | "entregada"
export type EstadoPagoEntrega = "pendiente_pago" | "pagado"

export interface EntregaItem {
  id: string
  entregaId: string
  productoId: string
  cantidad: number
  precioCosto: number
  nombre?: string
  producto?: Producto
}

export interface CreateEntregaItemInput {
  productoId: string
  cantidad: number
}

export interface CreateEntregaInput {
  proveedorId?: string
  sucursalId?: string
  fechaPrevista: string
  items: CreateEntregaItemInput[]
}

export interface Entrega {
  id: string
  proveedorId: string
  proveedor?: Usuario
  sucursalId?: string | null
  sucursal?: Sucursal | null
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
