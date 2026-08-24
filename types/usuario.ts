export type Rol = "admin" | "usuario" | "proveedor" | "vendedor"

export interface Usuario {
  id: string
  nombre: string
  correo: string
  rol: Rol
  activo: boolean
  ultimoAcceso: string
  permisos?: Record<string, boolean>
  vendeMateriales?: boolean
}

export const rolLabel: Record<Rol, string> = {
  admin: "Administrador",
  usuario: "Usuario",
  proveedor: "Proveedor",
  vendedor: "Vendedor",
}
