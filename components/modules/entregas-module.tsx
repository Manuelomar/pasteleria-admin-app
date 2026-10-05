"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, Plus, Calendar, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { api } from "@/services"
import { type Entrega, type Usuario } from "@/types"
import { currency, formatDate } from "@/lib/utils"
import { Loader } from "@/components/ui/loader"
import { LoadingOverlay } from "@/components/ui/loading-overlay"
import { Checkbox } from "@/components/ui/checkbox"
import { EntregaDialog } from "../dialogs/entrega-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Swal from "sweetalert2"
import { AppPagination } from "@/components/ui/app-pagination"
import { useDebounce } from "@/hooks/use-debounce"

export function EntregasModule() {
  const [entregas, setEntregas] = useState<Entrega[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [filtroEstado, setFiltroEstado] = useState("pendiente")
  const [proveedores, setProveedores] = useState<Usuario[]>([])
  const [proveedorId, setProveedorId] = useState<string>("todos")
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  const fetchEntregas = (page: number, size: number, filtro: string, query: string, provId: string) => {
    setIsLoading(true)
    api.entregas.getPaged(page, size, filtro, query, provId !== 'todos' ? provId : undefined)
      .then((data) => {
        setEntregas(data.data)
        setTotalPages(data.totalPages)
        setTotalItems(data.total)
      })
      .catch((err) => {
        console.error("Error fetching entregas", err)
        toast.error("Error al cargar las entregas")
      })
      .finally(() => setIsLoading(false))
  }

  const debouncedFetch = useDebounce(
    (page: number, size: number, filtro: string, query: string, provId: string) => fetchEntregas(page, size, filtro, query, provId),
    300
  )

  useEffect(() => {
    api.auth.getMe().then(user => {
      setCurrentUser(user)
    }).catch(console.error)

    api.usuarios.getAll().then(users => {
      setProveedores(users.filter(u => u.rol === 'proveedor' && u.activo))
    }).catch(console.error)
  }, [])

  useEffect(() => {
    debouncedFetch(currentPage, pageSize, filtroEstado, search, proveedorId)
    return () => debouncedFetch.cancel()
  }, [currentPage, pageSize, filtroEstado, search, proveedorId, debouncedFetch])

  // Reset page and selection when search, filtro or proveedor changes
  useEffect(() => {
    setCurrentPage(1)
    setSelectedIds([])
  }, [search, filtroEstado, proveedorId])

  const handleUpdateEstado = async (id: string, estado: string) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Deseas cambiar el estado de entrega?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444' // Match primary color style
    });

    if (result.isConfirmed) {
      try {
        await api.entregas.updateEstadoEntrega(id, estado)
        toast.success("Estado de entrega actualizado")
        fetchEntregas(currentPage, pageSize, filtroEstado, search, proveedorId)
      } catch (e) {
        toast.error("Error al actualizar estado")
      }
    }
  }

  const handleUpdatePago = async (id: string, estado: string) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Deseas cambiar el estado de pago?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444' // Match primary color style
    });

    if (result.isConfirmed) {
      try {
        await api.entregas.updateEstadoPago(id, estado)
        toast.success("Estado de pago actualizado")
        fetchEntregas(currentPage, pageSize, filtroEstado, search, proveedorId)
      } catch (e) {
        toast.error("Error al actualizar pago")
      }
    }
  }

  const handleBulkPagar = async () => {
    if (selectedIds.length === 0) return
    const result = await Swal.fire({
      title: '¿Pagar entregas seleccionadas?',
      text: `¿Deseas marcar ${selectedIds.length} entrega(s) como pagadas? (Doble validación)`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, continuar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#22c55e'
    });

    if (result.isConfirmed) {
      // Doble validación
      const secondResult = await Swal.fire({
        title: 'Confirmación final',
        text: 'Esta acción actualizará el estado de pago de todas las entregas seleccionadas a "Pagado". ¿Estás seguro?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, pagar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#22c55e'
      });

      if (secondResult.isConfirmed) {
        setIsLoading(true)
        try {
          await Promise.all(selectedIds.map(id => api.entregas.updateEstadoPago(id, 'pagado')))
          toast.success("Entregas pagadas correctamente")
          setSelectedIds([])
          fetchEntregas(currentPage, pageSize, filtroEstado, search, proveedorId)
        } catch (e) {
          toast.error("Error al actualizar entregas")
        } finally {
          setIsLoading(false)
        }
      }
    }
  }

  const handleAddStock = async (id: string) => {
    const result = await Swal.fire({
      title: '¿Añadir a Stock?',
      text: '¿Deseas añadir estos productos al inventario de la tienda? No se mezclarán con los del proveedor.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, añadir',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444' // Match primary color style
    });

    if (result.isConfirmed) {
      try {
        await api.entregas.addToStock(id)
        toast.success("Productos añadidos al stock correctamente")
        fetchEntregas(currentPage, pageSize, filtroEstado, search, proveedorId)
      } catch (e: any) {
        toast.error(e.message || "Error al añadir al stock")
      }
    }
  }

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: '¿Descartar entrega?',
      text: 'Esta acción no se puede deshacer. Se eliminará la entrega programada.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, descartar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444' // Match primary color style
    });

    if (result.isConfirmed) {
      try {
        await api.entregas.remove(id)
        toast.success("Entrega descartada correctamente")
        fetchEntregas(currentPage, pageSize, filtroEstado, search, proveedorId)
      } catch (e: any) {
        toast.error(e.message || "Error al descartar la entrega")
      }
    }
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === entregas.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(entregas.map(e => e.id))
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const isProveedor = currentUser?.rol === "proveedor"
  const isAdmin = currentUser?.rol === "admin"

  return (
    <div className="flex flex-col gap-5 relative min-h-[400px]">
      <LoadingOverlay active={isLoading} />
      <div className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">
          {isProveedor ? "Gestiona tus entregas programadas." : "Revisa y administra las entregas de los proveedores."}
        </p>
      </div>

      <Tabs value={filtroEstado} onValueChange={setFiltroEstado} className="w-full">
        <TabsList variant="line" className="w-full flex-wrap justify-start border-b border-border pb-0 mb-2 gap-4 h-auto">
          <TabsTrigger value="pendiente" className="px-1 py-3 text-sm font-medium">Pendientes</TabsTrigger>
          <TabsTrigger value="pagado_no_entregado" className="px-1 py-3 text-sm font-medium">Pagado, no entregado</TabsTrigger>
          <TabsTrigger value="entregado_no_pagado" className="px-1 py-3 text-sm font-medium">Entregado, no pagado</TabsTrigger>
          <TabsTrigger value="finalizado" className="px-1 py-3 text-sm font-medium">Finalizados</TabsTrigger>
          <TabsTrigger value="todos" className="px-1 py-3 text-sm font-medium">Todos los estados</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto flex-1">
          <div className="relative w-full lg:max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Buscar entrega o proveedor..." 
              className="pl-9" 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {isAdmin && (
            <Select value={proveedorId} onValueChange={(v) => v && setProveedorId(v)}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Proveedor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los proveedores</SelectItem>
                {proveedores.map(prov => (
                  <SelectItem key={prov.id} value={prov.id}>{prov.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <div className="flex gap-2">
          {isAdmin && selectedIds.length > 0 && (
            <Button variant="default" className="bg-green-600 hover:bg-green-700 text-white" onClick={handleBulkPagar}>
              Pagar Seleccionadas ({selectedIds.length})
            </Button>
          )}
          {(isProveedor || isAdmin) && (
            <Button onClick={() => setDialogOpen(true)}>
              <Plus data-icon="inline-start" />
              Programar Entrega
            </Button>
          )}
        </div>
      </div>

      {entregas.length > 0 && isAdmin && (
        <div className="flex items-center space-x-2 px-1">
          <Checkbox 
            id="selectAll" 
            checked={selectedIds.length === entregas.length && entregas.length > 0} 
            onCheckedChange={toggleSelectAll} 
          />
          <Label htmlFor="selectAll" className="text-sm cursor-pointer select-none">
            Seleccionar todas en esta página
          </Label>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {entregas.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No hay entregas programadas que coincidan con los filtros.
          </div>
        ) : (
          entregas.map((entrega) => (
            <Card key={entrega.id} className="overflow-hidden relative">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  {isAdmin && (
                    <div className="absolute top-4 right-4 md:top-6 md:left-6 md:right-auto z-10 bg-background/80 rounded-full p-0.5">
                      <Checkbox 
                        checked={selectedIds.includes(entrega.id)}
                        onCheckedChange={() => toggleSelect(entrega.id)}
                      />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-6 md:pl-14">
                    {/* Encabezado con Proveedor, Fecha y Monto */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-6 pb-4 border-b border-border/50 gap-4">
                      <div>
                        {isAdmin && entrega.proveedor ? (
                          <h3 className="text-lg font-semibold text-foreground">
                            {entrega.proveedor.nombre || (entrega.proveedor as any).name}
                          </h3>
                        ) : (
                          <h3 className="text-lg font-semibold text-foreground">
                            Entrega Programada
                          </h3>
                        )}
                        <div className="flex flex-col space-y-1 mt-3">
                          <span className="text-sm">
                            <span className="font-semibold">Prevista:</span>{" "}
                            {formatDate(entrega.fechaPrevista)}
                          </span>
                          {entrega.fechaReal && (
                            <span className="text-sm">
                              <span className="font-semibold">Real:</span>{" "}
                              {formatDate(entrega.fechaReal)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Total</p>
                        <p className="text-2xl font-heading font-bold text-primary">
                          {currency(entrega.totalCosto)}
                        </p>
                      </div>
                    </div>
                    
                    {/* Lista de Productos */}
                    <div>
                      <p className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Productos a entregar</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {entrega.items.map(item => (
                          <div key={item.id} className="flex items-center gap-3 p-3 rounded-md bg-muted/20 border border-border/50 transition-colors hover:bg-muted/40">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-primary/10 text-primary font-bold text-sm">
                              {item.cantidad}
                            </div>
                            <p className="text-sm font-medium">
                              {item.producto?.nombre || "Producto desconocido"}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 p-4 md:w-56 md:border-l md:border-border md:p-6 lg:w-72 bg-muted/10">
                    {isAdmin ? (
                      <>
                        {!entrega.agregadoAlStock && (
                          <div className="flex flex-col gap-2">
                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Estado Entrega</Label>
                            <Select 
                              value={entrega.estadoEntrega} 
                              onValueChange={(v) => v && handleUpdateEstado(entrega.id, v)}
                            >
                              <SelectTrigger className="bg-background shadow-sm h-9 border-muted-foreground/20 hover:border-primary/50 transition-colors">
                                <SelectValue>
                                  {entrega.estadoEntrega === 'entregada' ? 'Entregada' : 'En espera'}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="en_espera">En espera</SelectItem>
                                <SelectItem value="entregada">Entregada</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        {!(entrega.estadoEntrega === 'entregada' && entrega.estadoPago === 'pagado' && entrega.agregadoAlStock) && (
                          <div className="flex flex-col gap-2">
                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Estado Pago</Label>
                            <Select 
                              value={entrega.estadoPago} 
                              onValueChange={(v) => v && handleUpdatePago(entrega.id, v)}
                            >
                              <SelectTrigger className="bg-background shadow-sm h-9 border-muted-foreground/20 hover:border-primary/50 transition-colors">
                                <SelectValue>
                                  {entrega.estadoPago === 'pagado' ? 'Pagado' : 'Pendiente'}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pendiente_pago">Pendiente</SelectItem>
                                <SelectItem value="pagado">Pagado</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        {entrega.estadoEntrega === 'entregada' && !entrega.agregadoAlStock && (
                          <Button onClick={() => handleAddStock(entrega.id)} className="mt-4 w-full">
                            Añadir a Stock
                          </Button>
                        )}
                        {entrega.agregadoAlStock && (
                          <div className="mt-4 flex items-center justify-center rounded-md bg-green-500/10 text-green-600 text-xs py-2.5 font-semibold">
                            Añadido al Stock
                          </div>
                        )}
                        {!entrega.agregadoAlStock && (
                          <Button variant="outline" className="mt-4 w-full border-red-500/50 text-red-600 hover:bg-red-500/10" onClick={() => handleDelete(entrega.id)}>
                            <Trash2 className="size-4 mr-2" />
                            Descartar
                          </Button>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-semibold text-muted-foreground uppercase">Entrega</span>
                          <Badge variant={entrega.estadoEntrega === 'entregada' ? 'default' : 'secondary'} className="w-fit">
                            {entrega.estadoEntrega === 'entregada' ? 'Entregada' : 'En Espera'}
                          </Badge>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-semibold text-muted-foreground uppercase">Pago</span>
                          <Badge variant={entrega.estadoPago === 'pagado' ? 'default' : 'destructive'} className="w-fit">
                            {entrega.estadoPago === 'pagado' ? 'Pagado' : 'Pendiente'}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {entregas.length > 0 && (
        <AppPagination
          currentPage={currentPage}
          pageSize={pageSize}
          pageSizeOptions={[10, 20, 50, 100]}
          totalItems={totalItems}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size)
            setCurrentPage(1)
          }}
          itemName="entregas"
        />
      )}

      <EntregaDialog 
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSaved={() => fetchEntregas(currentPage, pageSize, filtroEstado, search, proveedorId)}
        currentUser={currentUser}
      />
    </div>
  )
}
