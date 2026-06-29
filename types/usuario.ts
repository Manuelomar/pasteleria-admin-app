export type Rol = "admin" | "usuario" | "proveedor"

export interface Usuario {
  id: string
  nombre: string
  correo: string
  rol: Rol
  activo: boolean
  ultimoAcceso: string
  permisos?: Record<string, boolean>
}

export const rolLabel: Record<Rol, string> = {
  admin: "Administrador",
  usuario: "Usuario",
  proveedor: "Proveedor",
}
