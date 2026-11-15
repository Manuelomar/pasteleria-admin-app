export type Rol = "superadmin" | "admin" | "usuario" | "proveedor" | "vendedor"

export interface Usuario {
  id: string
  nombre: string
  name?: string
  username?: string
  correo: string
  rol: Rol
  activo: boolean
  ultimoAcceso: string
  permisos?: Record<string, boolean>
  vendeMateriales?: boolean
  isProvider?: boolean
  sucursalId?: string | null
  sucursalNombre?: string | null
}

export const rolLabel: Record<Rol, string> = {
  superadmin: "Super Admin",
  admin: "Administrador",
  usuario: "Usuario",
  proveedor: "Proveedor",
  vendedor: "Vendedor",
}
