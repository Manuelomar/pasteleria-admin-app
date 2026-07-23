"use client"

import { useState, useEffect } from "react"
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

export function EntregasModule() {
  const [entregas, setEntregas] = useState<Entrega[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [filtroEstado, setFiltroEstado] = useState("pendiente")

  const fetchEntregas = (filtro: string = filtroEstado) => {
    if (entregas.length === 0) setIsLoading(true)
    api.entregas.getAll(filtro)
      .then(setEntregas)
      .catch((err) => {
        console.error("Error fetching entregas", err)
        toast.error("Error al cargar las entregas")
      })
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    api.auth.getMe().then(user => {
      setCurrentUser(user)
    }).catch(console.error)
  }, [])

  useEffect(() => {
    fetchEntregas(filtroEstado)
  }, [filtroEstado])

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
        fetchEntregas()
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
        fetchEntregas()
      } catch (e) {
        toast.error("Error al actualizar pago")
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
        fetchEntregas()
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
        fetchEntregas()
      } catch (e: any) {
        toast.error(e.message || "Error al descartar la entrega")
      }
    }
  }

  

  const isProveedor = currentUser?.rol === "proveedor"
  const isAdmin = currentUser?.rol === "admin"

  const entregasFiltradas = entregas.filter(e => {
    if (search.trim()) {
      const query = search.toLowerCase()
      const provName = (e.proveedor?.nombre || (e.proveedor as any)?.name || "").toLowerCase()
      const matchesProveedor = provName.includes(query)
      const matchesProductos = e.items.some(i => i.producto?.nombre?.toLowerCase().includes(query))
      return matchesProveedor || matchesProductos
    }
    return true
  })

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
        <div className="relative w-full lg:max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Buscar entrega o proveedor..." 
            className="pl-9" 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {(isProveedor || isAdmin) && (
          <Button onClick={() => setDialogOpen(true)}>
            <Plus data-icon="inline-start" />
            Programar Entrega
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {entregasFiltradas.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No hay entregas programadas que coincidan con los filtros.
          </div>
        ) : (
          entregasFiltradas.map((entrega) => (
            <Card key={entrega.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className="flex flex-1 flex-col p-6">
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

      <EntregaDialog 
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSaved={fetchEntregas}
        currentUser={currentUser}
      />
    </div>
  )
}
