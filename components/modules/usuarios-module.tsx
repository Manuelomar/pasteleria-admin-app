"use client"

import { useState, useEffect } from "react"
import { Search, Plus, MoreHorizontal, Pencil, Shield, Power, KeyRound } from "lucide-react"
import { toast } from "sonner"
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
import { UsuarioDialog } from "@/components/dialogs/usuario-dialog"
import { rolLabel, type Usuario, type Rol } from "@/lib/data"
import { api } from "@/lib/api"
import { AppPagination } from "@/components/ui/app-pagination"

export function UsuariosModule() {
  const [search, setSearch] = useState("")
  const [rol, setRol] = useState<"todos" | Rol>("todos")
  const [estado, setEstado] = useState<"todos" | "activo" | "inactivo">("todos")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Usuario | null>(null)
  const [items, setItems] = useState<Usuario[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const fetchUsuarios = () => {
    setIsLoading(true)
    api.usuarios.getPaged(currentPage, pageSize, search, rol, estado)
      .then((res) => {
        setItems(res.data)
        setTotalItems(res.total)
        setTotalPages(res.totalPages)
      })
      .catch((err) => {
        console.error("Error fetching usuarios", err)
        toast.error("Error de conexión al cargar usuarios")
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

  const filtered = items

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-muted-foreground">
        Administra los usuarios del sistema, sus roles y accesos.
      </p>

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
                    {new Date(u.ultimoAcceso).toLocaleString("es-DO", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
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
                            Editar usuario
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.info(`Cambiar rol de ${u.nombre}`)}>
                            <Shield className="size-4" />
                            Cambiar rol
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.warning(`${u.nombre} ${u.activo ? "inactivado" : "activado"}`)}>
                            <Power className="size-4" />
                            {u.activo ? "Inactivar" : "Activar"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.success(`Contraseña restablecida para ${u.nombre}`)}>
                            <KeyRound className="size-4" />
                            Restablecer contraseña
                          </DropdownMenuItem>
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

      {/* Paginación */}
      <AppPagination
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={totalItems}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemName="usuarios"
      />

      <UsuarioDialog open={dialogOpen} onOpenChange={setDialogOpen} usuario={editing} onSaved={fetchUsuarios} />
    </div>
  )
}
