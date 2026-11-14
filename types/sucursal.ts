export interface Sucursal {
  id: string
  nombre: string
  codigo: string
  direccion?: string | null
  telefono?: string | null
  activa: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateSucursalInput {
  nombre: string
  codigo: string
  direccion?: string
  telefono?: string
  activa?: boolean
}

export type UpdateSucursalInput = Partial<CreateSucursalInput>
