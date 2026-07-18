"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Users, Receipt, DollarSign, WalletCards } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import Swal from "sweetalert2"
import { currency, type Venta } from "@/types"
import { api } from "@/services"
import { API_URL } from "@/services/api.config"
import { Loader } from "@/components/ui/loader"

export function CuentasCobrarModule() {
  const [pendientes, setPendientes] = useState<Venta[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedVenta, setSelectedVenta] = useState<Venta | null>(null)
  
  // Modal state
  const [montoPago, setMontoPago] = useState<number | "">("")
  const [metodoPago, setMetodoPago] = useState<string>("efectivo")
  const [isPaying, setIsPaying] = useState(false)

  const loadPendientes = () => {
    setIsLoading(true)
    api.ventas.getPendientes()
      .then((data) => {
        setPendientes(data)
      })
      .catch((err) => {
        console.error(err)
        toast.error("Error al cargar las cuentas por cobrar")
      })
      .finally(() => setIsLoading(false))
  }

  const imprimirFactura = async (id: string) => {
    const iframeId = "print-invoice-iframe"
    let existingIframe = document.getElementById(iframeId) as HTMLIFrameElement
    if (existingIframe) {
      existingIframe.remove()
    }

    const iframe = document.createElement("iframe")
    iframe.id = iframeId
    iframe.style.position = "absolute"
    iframe.style.width = "0px"
    iframe.style.height = "0px"
    iframe.style.border = "none"
    
    document.body.appendChild(iframe)

    try {
      const res = await fetch(`${API_URL.replace('/api', '')}/api/ventas/${id}/print`);
      const html = await res.text();
      
      iframe.onload = () => {
        if (iframe.contentWindow) {
          const originalTitle = document.title;
          const timestamp = new Date().getTime();
          document.title = `Abono_${id}_${timestamp}`;
          iframe.contentWindow.print();
          document.title = originalTitle;
        }
      };
      
      iframe.srcdoc = html;
    } catch (error) {
      console.error("Error al imprimir la factura", error);
    }
  }

  useEffect(() => {
    loadPendientes()
  }, [])

  const handleOpenPayment = (venta: Venta) => {
    setSelectedVenta(venta)
    setMontoPago(venta.balance)
    setMetodoPago("efectivo")
  }

  const handleProcessPayment = async () => {
    if (!selectedVenta) return
    const amount = Number(montoPago)
    if (isNaN(amount) || amount <= 0) {
      toast.error("Ingrese un monto válido")
      return
    }

    if (amount > selectedVenta.balance) {
      toast.error("El monto no puede ser mayor al balance pendiente")
      return
    }

    setIsPaying(true)
    try {
      const nuevoBalance = selectedVenta.balance - amount
      const nuevoMontoPagado = (Number(selectedVenta.montoPagado) || 0) + amount
      const nuevoEstado = nuevoBalance <= 0 ? "pagado" : "parcial"

      await api.ventas.update(selectedVenta.id, {
        montoPagado: nuevoMontoPagado,
        balance: nuevoBalance,
        estadoPago: nuevoEstado,
        // Opcional: si quisieran registrar el metodo del abono, 
        // normalmente se guarda en un historial, pero actualizamos el principal por ahora
        metodoPago: metodoPago as any
      })

      setSelectedVenta(null)
      loadPendientes()

      const printConfirm = await Swal.fire({
        title: "¡Pago Registrado!",
        text: `El pago de ${currency(amount)} se ha procesado.\n\n¿Desea imprimir el comprobante/factura?`,
        icon: "success",
        showCancelButton: true,
        confirmButtonText: "Sí, imprimir",
        cancelButtonText: "No, cerrar",
        confirmButtonColor: "#e11d48",
        cancelButtonColor: "#6b7280",
      })

      if (printConfirm.isConfirmed) {
        imprimirFactura(selectedVenta.id)
      }

    } catch (error) {
      console.error(error)
      toast.error("Error al procesar el pago")
    } finally {
      setIsPaying(false)
    }
  }

  // Agrupación opcional o totales
  const totalPorCobrar = pendientes.reduce((acc, v) => acc + Number(v.balance || 0), 0)
  const totalFacturas = pendientes.length

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <DollarSign className="size-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total por Cobrar</span>
              <span className="font-heading text-2xl font-bold text-primary">{currency(totalPorCobrar)}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card/50 shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Receipt className="size-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Facturas Pendientes</span>
              <span className="font-heading text-2xl font-bold text-foreground">{totalFacturas}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-border bg-card/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Detalle de Cuentas por Cobrar</CardTitle>
          <CardDescription>Lista de facturas con pagos pendientes (estado parcial o pendiente).</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-20 flex justify-center items-center">
              <Loader />
            </div>
          ) : pendientes.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Factura</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead className="text-right">Total Factura</TableHead>
                    <TableHead className="text-right">Monto Pagado</TableHead>
                    <TableHead className="text-right text-amber-600">Balance Pendiente</TableHead>
                    <TableHead className="text-center">Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendientes.map((venta) => {
                    const fecha = new Date(venta.fecha).toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' })
                    const isParcial = venta.estadoPago === 'parcial'
                    return (
                      <TableRow key={venta.id}>
                        <TableCell className="font-mono text-sm font-medium">{venta.factura}</TableCell>
                        <TableCell className="text-sm">{fecha}</TableCell>
                        <TableCell className="text-sm font-semibold">{((venta as any).cliente?.nombre) || venta.clienteNombre || "Cliente de Paso"}</TableCell>
                        <TableCell className="text-right">{currency(venta.total)}</TableCell>
                        <TableCell className="text-right">{currency(venta.montoPagado)}</TableCell>
                        <TableCell className="text-right font-bold text-amber-600 dark:text-amber-400">{currency(venta.balance)}</TableCell>
                        <TableCell className="text-center">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${isParcial ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                            {venta.estadoPago.toUpperCase()}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="default" onClick={() => handleOpenPayment(venta)}>
                            Saldar Deuda
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center text-muted-foreground">
              <Users className="size-12 opacity-20 mb-3" />
              <p>No hay cuentas por cobrar actualmente.</p>
              <p className="text-sm">Todos los clientes están al día.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedVenta} onOpenChange={(open) => !open && setSelectedVenta(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Procesar Pago</DialogTitle>
            <DialogDescription>
              Factura: {selectedVenta?.factura} - {((selectedVenta as any)?.cliente?.nombre) || selectedVenta?.clienteNombre}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-1 rounded-md bg-amber-50 dark:bg-amber-900/10 p-3 border border-amber-200 dark:border-amber-900/50">
              <span className="text-xs font-semibold text-amber-800 dark:text-amber-400 uppercase">Balance Pendiente</span>
              <span className="text-xl font-bold text-amber-600 dark:text-amber-500">{selectedVenta ? currency(selectedVenta.balance) : ''}</span>
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="monto" className="text-sm font-medium">
                Monto a Recibir (RD$)
              </label>
              <Input
                id="monto"
                type="number"
                value={montoPago}
                onChange={(e) => setMontoPago(e.target.value === "" ? "" : Number(e.target.value))}
                min={0}
                max={selectedVenta?.balance}
                step={0.01}
                autoFocus
              />
            </div>
            
            <div className="grid gap-2">
              <label className="text-sm font-medium">Método de Pago</label>
              <Select value={metodoPago} onValueChange={(val) => val && setMetodoPago(val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="efectivo">Efectivo</SelectItem>
                  <SelectItem value="tarjeta">Tarjeta de Crédito / Débito</SelectItem>
                  <SelectItem value="transferencia">Transferencia Bancaria</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedVenta(null)} disabled={isPaying}>
              Cancelar
            </Button>
            <Button onClick={handleProcessPayment} disabled={isPaying || !montoPago || montoPago <= 0}>
              {isPaying ? "Procesando..." : "Confirmar Pago"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
