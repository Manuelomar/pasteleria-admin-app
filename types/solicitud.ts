export interface Solicitud {
  id: string
  tipo: 'bizcocho' | 'combo'
  nombre: string
  apellido: string
  correo: string | null
  telefono: string
  configuracion: Record<string, any> | null
  precioEstimado: number | null
  imagenReferencia: string | null
  estado: 'pendiente' | 'en-proceso' | 'completada' | 'cancelada'
  createdAt: string
  updatedAt: string
}

export type EstadoSolicitud = Solicitud['estado']
