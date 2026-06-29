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
