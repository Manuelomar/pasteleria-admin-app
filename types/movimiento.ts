import { EstadoPago } from "./venta"

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
