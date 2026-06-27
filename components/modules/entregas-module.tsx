"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Calendar } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { api } from "@/lib/api"
import { currency, type Entrega, type Usuario } from "@/lib/data"
import { Loader } from "@/components/ui/loader"
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

export function EntregasModule() {
  const [entregas, setEntregas] = useState<Entrega[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [filtroEstado, setFiltroEstado] = useState("todos")

  const fetchEntregas = (filtro: string = filtroEstado) => {
    setIsLoading(true)
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
    try {
      await api.entregas.updateEstadoEntrega(id, estado)
      toast.success("Estado de entrega actualizado")
      fetchEntregas()
    } catch (e) {
      toast.error("Error al actualizar estado")
    }
  }

  const handleUpdatePago = async (id: string, estado: string) => {
    try {
      await api.entregas.updateEstadoPago(id, estado)
      toast.success("Estado de pago actualizado")
      fetchEntregas()
    } catch (e) {
      toast.error("Error al actualizar pago")
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader />
      </div>
    )
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
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">
          {isProveedor ? "Gestiona tus entregas programadas." : "Revisa y administra las entregas de los proveedores."}
        </p>
      </div>

      <Tabs value={filtroEstado} onValueChange={setFiltroEstado} className="w-full">
        <TabsList variant="line" className="w-full justify-start overflow-x-auto border-b border-border pb-0 mb-2 gap-4">
          <TabsTrigger value="todos" className="px-1 py-3 text-sm font-medium">Todos los estados</TabsTrigger>
          <TabsTrigger value="pendiente" className="px-1 py-3 text-sm font-medium">Pendientes</TabsTrigger>
          <TabsTrigger value="pagado_no_entregado" className="px-1 py-3 text-sm font-medium">Pagado, no entregado</TabsTrigger>
          <TabsTrigger value="entregado_no_pagado" className="px-1 py-3 text-sm font-medium">Entregado, no pagado</TabsTrigger>
          <TabsTrigger value="finalizado" className="px-1 py-3 text-sm font-medium">Finalizados</TabsTrigger>
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
                  <div className="flex flex-1 flex-col justify-center border-b md:border-b-0 md:border-r border-border p-4 bg-muted/30">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Calendar className="size-4 text-primary" />
                      {new Date(entrega.fechaPrevista).toLocaleDateString()}
                    </div>
                    {isAdmin && entrega.proveedor && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        Proveedor: <span className="font-semibold text-foreground">{entrega.proveedor.nombre || (entrega.proveedor as any).name}</span>
                      </p>
                    )}
                    <p className="mt-2 text-xl font-heading font-bold text-primary">
                      {currency(entrega.totalCosto)}
                    </p>
                  </div>
                  
                  <div className="flex flex-[2] flex-col gap-2 p-4">
                    <p className="text-sm font-semibold">Productos a entregar:</p>
                    <ul className="text-sm text-muted-foreground list-disc pl-5">
                      {entrega.items.map(item => (
                        <li key={item.id}>
                          {item.cantidad}x {item.producto?.nombre || "Producto desconocido"}
                        </li>
                      ))}
                    </ul>
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
                              <SelectValue />
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
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pendiente_pago">Pendiente</SelectItem>
                              <SelectItem value="pagado">Pagado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
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
