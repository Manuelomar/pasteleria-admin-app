"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Plus,
  MoreHorizontal,
  Pencil,
  Power,
  Copy,
  MapPin,
  Phone,
  Building2,
} from "lucide-react"
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
import { SucursalDialog } from "@/components/dialogs/sucursal-dialog"
import { ClonarCatalogoDialog } from "@/components/dialogs/clonar-catalogo-dialog"
import type { Sucursal } from "@/types"
import { api } from "@/services"
import { LoadingOverlay } from "@/components/ui/loading-overlay"

export function SucursalesModule() {
  const [search, setSearch] = useState("")
  const [estado, setEstado] = useState<"todos" | "activa" | "inactiva">("todos")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Sucursal | null>(null)
  const [clonarDialogOpen, setClonarDialogOpen] = useState(false)
  const [clonarDestinoId, setClonarDestinoId] = useState<string | undefined>(undefined)
  const [items, setItems] = useState<Sucursal[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchSucursales = () => {
    setIsLoading(true)
    Promise.all([
      api.sucursales.getAll(true),
      new Promise((resolve) => setTimeout(resolve, 500)),
    ])
      .then(([list]) => {
        setItems(list)
      })
      .catch((err) => {
        console.error("Error fetching sucursales", err)
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error de conexión al cargar sucursales",
          confirmButtonColor: "#e11d48",
        })
      })
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    fetchSucursales()
  }, [])

  const handleSearchChange = (val: string) => {
    setSearch(val)
  }

  const handleToggleActiva = async (sucursal: Sucursal) => {
    try {
      await api.sucursales.toggleActiva(sucursal.id)
      Swal.fire({
        icon: "success",
        title: "Éxito",
        text: `${sucursal.nombre} ha sido ${!sucursal.activa ? "activada" : "desactivada"}`,
        confirmButtonColor: "#e11d48",
      })
      fetchSucursales()
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Error al cambiar el estado de la sucursal"
      console.error(err)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMsg,
        confirmButtonColor: "#e11d48",
      })
    }
  }

  const handleSaved = () => {
    fetchSucursales()
  }

  const handleOpenClonar = (destinoId: string) => {
    setClonarDestinoId(destinoId)
    setClonarDialogOpen(true)
  }

  const filtered = items.filter((s) => {
    const matchesSearch =
      !search ||
      s.nombre.toLowerCase().includes(search.toLowerCase()) ||
      s.codigo.toLowerCase().includes(search.toLowerCase()) ||
      (s.direccion && s.direccion.toLowerCase().includes(search.toLowerCase()))

    const matchesEstado =
      estado === "todos" ||
      (estado === "activa" && s.activa) ||
      (estado === "inactiva" && !s.activa)

    return matchesSearch && matchesEstado
  })

  return (
    <div className="flex flex-col gap-5 relative min-h-[400px]">
      <LoadingOverlay active={isLoading} />
      <p className="text-sm text-muted-foreground">
        Administra las sucursales del negocio, sus datos de contacto y catálogos de productos.
      </p>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, código o dirección..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={estado} onValueChange={(val) => setEstado((val ?? "todos") as "todos" | "activa" | "inactiva")}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas</SelectItem>
              <SelectItem value="activa">Activas</SelectItem>
              <SelectItem value="inactiva">Inactivas</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() => {
              setEditing(null)
              setDialogOpen(true)
            }}
          >
            <Plus data-icon="inline-start" />
            Nueva sucursal
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sucursal</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Dirección</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Creada</TableHead>
                <TableHead className="text-right pr-6">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    {isLoading
                      ? "Cargando sucursales..."
                      : search || estado !== "todos"
                        ? "No se encontraron sucursales con los filtros aplicados."
                        : "No hay sucursales registradas. Crea la primera."}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="size-4 text-muted-foreground shrink-0" />
                        <span className="font-semibold text-foreground">{s.nombre}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-mono font-medium">
                        {s.codigo}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {s.direccion ? (
                        <div className="flex items-center gap-1.5 text-sm">
                          <MapPin className="size-3.5 text-muted-foreground shrink-0" />
                          <span className="truncate max-w-[200px]">{s.direccion}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {s.telefono ? (
                        <div className="flex items-center gap-1.5 text-sm">
                          <Phone className="size-3.5 text-muted-foreground shrink-0" />
                          <span>{s.telefono}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <ActivoBadge activo={s.activa} />
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDateTime(s.createdAt)}
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
                                setEditing(s)
                                setDialogOpen(true)
                              }}
                            >
                              <Pencil className="size-4" />
                              Editar sucursal
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenClonar(s.id)}>
                              <Copy className="size-4" />
                              Clonar catálogo hacia aquí
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleActiva(s)}>
                              <Power className="size-4" />
                              {s.activa ? "Desactivar" : "Activar"}
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <SucursalDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        sucursal={editing}
        onSaved={handleSaved}
      />

      <ClonarCatalogoDialog
        open={clonarDialogOpen}
        onOpenChange={setClonarDialogOpen}
        onCloned={fetchSucursales}
        defaultDestinoId={clonarDestinoId}
      />
    </div>
  )
}

