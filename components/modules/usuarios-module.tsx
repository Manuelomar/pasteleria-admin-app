"use client"

import { useState, useEffect } from "react"
import { Search, Plus, MoreHorizontal, Pencil, Shield, Power, KeyRound, Trash2 } from "lucide-react"
import Swal from "sweetalert2"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ActivoBadge } from "@/components/badges"
import { Badge } from "@/components/ui/badge"
import { formatDateTime } from "@/lib/utils"
import { UsuarioDialog } from "@/components/dialogs/usuario-dialog"
import { rolLabel, type Usuario, type Rol } from "@/types"
import { api } from "@/services"
import { AppPagination } from "@/components/ui/app-pagination"
import { Loader } from "@/components/ui/loader"
import { LoadingOverlay } from "@/components/ui/loading-overlay"

export function UsuariosModule() {
  const [search, setSearch] = useState("")
  const [rol, setRol] = useState<"todos" | Rol>("todos")
  const [estado, setEstado] = useState<"todos" | "activo" | "inactivo">("todos")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Usuario | null>(null)
  const [items, setItems] = useState<Usuario[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null)

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const fetchUsuarios = () => {
    setIsLoading(true)
    Promise.all([
      api.usuarios.getPaged(currentPage, pageSize, search, rol, estado),
      api.auth.getMe(),
      new Promise((resolve) => setTimeout(resolve, 1000))
    ])
      .then(([res, user]) => {
        setCurrentUser(user)
        const isAdmin = user.rol === "admin" || user.permisos?.usuarios === true
        
        if (isAdmin) {
          setItems(res.data)
          setTotalItems(res.total)
          setTotalPages(res.totalPages)
        } else {
          // If not admin, only show themselves
          const myUser = res.data.find(u => u.id === user.id) || user
          setItems([myUser])
          setTotalItems(1)
          setTotalPages(1)
        }
      })
      .catch((err) => {
        console.error("Error fetching usuarios", err)
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error de conexión al cargar usuarios",
          confirmButtonColor: "hsl(var(--primary))"
        })
      })
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    fetchUsuarios()
  }, [currentPage, search, rol, estado])

  const handleSearchChange = (val: string) => {
    setSearch(val)
    setCurrentPage(1)
  }

  const handleRolChange = (val: string | null) => {
    if (!val) return;
    setRol(val as "todos" | Rol)
    setCurrentPage(1)
  }

  const handleEstadoChange = (val: string | null) => {
    if (!val) return;
    setEstado(val as "todos" | "activo" | "inactivo")
    setCurrentPage(1)
  }

  const handleToggleActivo = async (usuario: Usuario) => {
    try {
      await api.usuarios.update(usuario.id, { ...usuario, activo: !usuario.activo })
      Swal.fire({
        icon: "success",
        title: "Éxito",
        text: `${usuario.nombre} ha sido ${!usuario.activo ? "activado" : "inactivado"}`,
        confirmButtonColor: "hsl(var(--primary))"
      })
      fetchUsuarios()
    } catch (err: any) {
      console.error(err)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Error al cambiar el estado del usuario",
        confirmButtonColor: "hsl(var(--primary))"
      })
    }
  }

  const handleDeleteUsuario = async (usuario: Usuario) => {
    const confirmation = await Swal.fire({
      title: "¿Está seguro?",
      text: `¿Desea eliminar al usuario ${usuario.nombre}? Esta acción ocultará al usuario pero mantendrá sus registros en el sistema.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#6b7280",
    })

    if (!confirmation.isConfirmed) return

    try {
      await api.usuarios.delete(usuario.id)
      Swal.fire({
        icon: "success",
        title: "Éxito",
        text: `Usuario ${usuario.nombre} eliminado`,
        confirmButtonColor: "hsl(var(--primary))"
      })
      fetchUsuarios()
    } catch (err: any) {
      console.error(err)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Error al eliminar el usuario",
        confirmButtonColor: "hsl(var(--primary))"
      })
    }
  }

  const filtered = items
  const isAdminUser = currentUser?.rol === "admin" || currentUser?.permisos?.usuarios === true

  

  return (
    <div className="flex flex-col gap-5 relative min-h-[400px]">
      <LoadingOverlay active={isLoading} />
      <p className="text-sm text-muted-foreground">
        {isAdminUser 
          ? "Administra los usuarios del sistema, sus roles y accesos." 
          : "Visualiza y edita la información de tu perfil."}
      </p>

      {isAdminUser && (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar usuario..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={rol} onValueChange={handleRolChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los roles</SelectItem>
              <SelectItem value="admin">Administrador</SelectItem>
              <SelectItem value="usuario">Usuario</SelectItem>
            </SelectContent>
          </Select>
          <Select value={estado} onValueChange={handleEstadoChange}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="activo">Activo</SelectItem>
              <SelectItem value="inactivo">Inactivo</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() => {
              setEditing(null)
              setDialogOpen(true)
            }}
          >
            <Plus data-icon="inline-start" />
            Nuevo usuario
          </Button>
        </div>
      </div>
      )}

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Último acceso</TableHead>
                <TableHead className="text-right pr-6">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground">{u.nombre}</span>
                      <span className="text-xs text-muted-foreground">{u.correo}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-medium">
                      {rolLabel[u.rol]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <ActivoBadge activo={u.activo} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDateTime(u.ultimoAcceso)}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost" size="icon" className="ml-auto">
                            <MoreHorizontal className="size-4" />
                            <span className="sr-only">Acciones</span>
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end">
                        <DropdownMenuGroup>
                          <DropdownMenuItem
                            onClick={() => {
                              setEditing(u)
                              setDialogOpen(true)
                            }}
                          >
                            <Pencil className="size-4" />
                            Editar {isAdminUser ? "usuario" : "perfil"}
                          </DropdownMenuItem>
                          {isAdminUser && (
                            <>
                              <DropdownMenuItem onClick={() => Swal.fire({
                                 icon: "info",
                                 title: "Información",
                                 text: `Cambiar rol de ${u.nombre}`,
                                 confirmButtonColor: "hsl(var(--primary))"
                               })}
                              >
                                <Shield className="size-4" />
                                Cambiar rol
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleActivo(u)}>
                                <Power className="size-4" />
                                {u.activo ? "Inactivar" : "Activar"}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => Swal.fire({
                                  icon: "success",
                                  title: "Éxito",
                                  text: `Contraseña restablecida para ${u.nombre}`,
                                  confirmButtonColor: "hsl(var(--primary))"
                                })}
                              >
                                <KeyRound className="size-4" />
                                Restablecer contraseña
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteUsuario(u)} className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20">
                                <Trash2 className="size-4" />
                                Eliminar usuario
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {isAdminUser && (
        <AppPagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={totalItems}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemName="usuarios"
        />
      )}

      <UsuarioDialog open={dialogOpen} onOpenChange={setDialogOpen} usuario={editing} onSaved={fetchUsuarios} currentUser={currentUser} />
    </div>
  )
}
