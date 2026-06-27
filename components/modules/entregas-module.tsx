"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Calendar } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

export function EntregasModule() {
  const [entregas, setEntregas] = useState<Entrega[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const fetchEntregas = () => {
    setIsLoading(true)
    api.entregas.getAll()
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
      fetchEntregas()
    }).catch(console.error)
  }, [])

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

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">
          {isProveedor ? "Gestiona tus entregas programadas." : "Revisa y administra las entregas de los proveedores."}
        </p>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar entrega..." className="pl-9" />
        </div>
        {(isProveedor || isAdmin) && (
          <Button onClick={() => setDialogOpen(true)}>
            <Plus data-icon="inline-start" />
            Programar Entrega
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {entregas.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No hay entregas programadas.
          </div>
        ) : (
          entregas.map((entrega) => (
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
                        Proveedor: <span className="font-semibold text-foreground">{entrega.proveedor.nombre}</span>
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

                  <div className="flex flex-1 flex-col gap-3 p-4 bg-muted/10 items-end justify-center">
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs text-muted-foreground">Estado Entrega</span>
                      {isAdmin ? (
                        <Select value={entrega.estadoEntrega} onValueChange={(val) => val && handleUpdateEstado(entrega.id, val)}>
                          <SelectTrigger className="h-7 w-32 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en_espera">En Espera</SelectItem>
                            <SelectItem value="entregada">Entregada</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant={entrega.estadoEntrega === 'entregada' ? 'default' : 'secondary'}>
                          {entrega.estadoEntrega === 'entregada' ? 'Entregada' : 'En Espera'}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex flex-col items-end gap-1 mt-2">
                      <span className="text-xs text-muted-foreground">Estado Pago</span>
                      {isAdmin ? (
                        <Select value={entrega.estadoPago} onValueChange={(val) => val && handleUpdatePago(entrega.id, val)}>
                          <SelectTrigger className="h-7 w-32 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pendiente_pago">Pendiente</SelectItem>
                            <SelectItem value="pagado">Pagado</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant={entrega.estadoPago === 'pagado' ? 'default' : 'destructive'}>
                          {entrega.estadoPago === 'pagado' ? 'Pagado' : 'Pendiente'}
                        </Badge>
                      )}
                    </div>
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
