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
  const [selectedCliente, setSelectedCliente] = useState<any | null>(null)
  
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
    const iframeId = `print-invoice-iframe-${id}`
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

  const handleOpenPayment = (cliente: any) => {
    setSelectedCliente(cliente)
    setMontoPago(cliente.balanceTotal)
    setMetodoPago("efectivo")
  }

  const handleProcessPayment = async () => {
    if (!selectedCliente) return
    const amount = Number(montoPago)
    if (isNaN(amount) || amount <= 0) {
      toast.error("Ingrese un monto válido")
      return
    }

    if (amount > selectedCliente.balanceTotal) {
      toast.error("El monto no puede ser mayor al balance pendiente total")
      return
    }

    setIsPaying(true)
    try {
      let montoRestante = amount;
      const facturasOrdenadas = [...selectedCliente.facturas].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
      
      const facturasAfectadas: { id: string, numero: string }[] = [];

      for (const factura of facturasOrdenadas) {
        if (montoRestante <= 0) break;
        
        const abonoAFactura = Math.min(montoRestante, factura.balance);
        const nuevoBalance = factura.balance - abonoAFactura;
        const nuevoMontoPagado = (Number(factura.montoPagado) || 0) + abonoAFactura;
        const nuevoEstado = nuevoBalance <= 0 ? "pagado" : "parcial";

        await api.ventas.update(factura.id, {
          montoPagado: nuevoMontoPagado,
          balance: nuevoBalance,
          estadoPago: nuevoEstado,
          metodoPago: metodoPago as any
        });

        facturasAfectadas.push({ id: factura.id, numero: factura.factura });
        montoRestante -= abonoAFactura;
      }

      setSelectedCliente(null)
      loadPendientes()

      const printConfirm = await Swal.fire({
        title: "¡Pago Registrado!",
        text: `El pago de ${currency(amount)} se ha procesado y distribuido en las facturas pendientes.\n\n¿Qué desea hacer con los comprobantes?`,
        icon: "success",
        showCancelButton: true,
        showDenyButton: true,
        confirmButtonText: "Imprimir",
        denyButtonText: "WhatsApp",
        cancelButtonText: "Cerrar",
        confirmButtonColor: "#e11d48",
        denyButtonColor: "#25D366",
        cancelButtonColor: "#6b7280",
      })

      if (printConfirm.isConfirmed) {
        for (let i = 0; i < facturasAfectadas.length; i++) {
          setTimeout(() => {
            imprimirFactura(facturasAfectadas[i].id)
          }, i * 1500);
        }
      } else if (printConfirm.isDenied) {
        toast.info("Generando facturas en PDF, un momento...");
        
        try {
          const html2pdf = (await import('html2pdf.js')).default;
          
          for (const factura of facturasAfectadas) {
            const res = await fetch(`${API_URL.replace('/api', '')}/api/ventas/${factura.id}/print`);
            const htmlContent = await res.text();
            
            const element = document.createElement('div');
            element.innerHTML = htmlContent;
            document.body.appendChild(element);
            
            const opt = {
              margin:       10,
              filename:     `Factura-${factura.numero}.pdf`,
              image:        { type: 'jpeg' as const, quality: 0.98 },
              html2canvas:  { scale: 2, useCORS: true },
              jsPDF:        { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
            };

            await html2pdf().set(opt).from(element).save();
            document.body.removeChild(element);
          }
          
          toast.success("PDFs descargados. Puedes adjuntarlos en WhatsApp.");
          const text = encodeURIComponent(`Hola, adjunto los comprobantes de su pago:\n\n` + facturasAfectadas.map(f => `📄 ${f.numero}`).join('\n'));
          window.open(`https://wa.me/?text=${text}`, '_blank');
        } catch (error) {
          console.error("Error al generar PDF:", error);
          toast.error("Hubo un error al generar los PDFs");
        }
      }

    } catch (error) {
      console.error(error)
      toast.error("Error al procesar el pago")
    } finally {
      setIsPaying(false)
    }
  }

  // Agrupación por cliente
  const clientesAgrupados = pendientes.reduce((acc, venta) => {
    const nombre = ((venta as any).cliente?.nombre) || venta.clienteNombre || "Cliente de Paso";
    if (!acc[nombre]) {
      acc[nombre] = {
        clienteNombre: nombre,
        clienteId: venta.clienteId,
        facturas: [],
        balanceTotal: 0,
        montoPagadoTotal: 0,
        totalFacturado: 0
      };
    }
    acc[nombre].facturas.push(venta);
    acc[nombre].balanceTotal += Number(venta.balance || 0);
    acc[nombre].montoPagadoTotal += Number(venta.montoPagado || 0);
    acc[nombre].totalFacturado += Number(venta.total || 0);
    return acc;
  }, {} as Record<string, any>);

  const clientesList = Object.values(clientesAgrupados).sort((a: any, b: any) => b.balanceTotal - a.balanceTotal);

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
                    <TableHead>Cliente</TableHead>
                    <TableHead className="text-center">Cant. Facturas</TableHead>
                    <TableHead className="text-right">Total Facturado</TableHead>
                    <TableHead className="text-right">Monto Pagado</TableHead>
                    <TableHead className="text-right text-amber-600">Balance Pendiente</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientesList.map((cliente: any) => {
                    return (
                      <TableRow key={cliente.clienteNombre}>
                        <TableCell className="text-sm font-semibold">{cliente.clienteNombre}</TableCell>
                        <TableCell className="text-center font-medium">{cliente.facturas.length}</TableCell>
                        <TableCell className="text-right">{currency(cliente.totalFacturado)}</TableCell>
                        <TableCell className="text-right">{currency(cliente.montoPagadoTotal)}</TableCell>
                        <TableCell className="text-right font-bold text-amber-600 dark:text-amber-400">{currency(cliente.balanceTotal)}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="default" onClick={() => handleOpenPayment(cliente)}>
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

      <Dialog open={!!selectedCliente} onOpenChange={(open) => !open && setSelectedCliente(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Procesar Pago</DialogTitle>
            <DialogDescription>
              Cliente: {selectedCliente?.clienteNombre} ({selectedCliente?.facturas.length} facturas)
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-1 rounded-md bg-amber-50 dark:bg-amber-900/10 p-3 border border-amber-200 dark:border-amber-900/50">
              <span className="text-xs font-semibold text-amber-800 dark:text-amber-400 uppercase">Balance Pendiente Total</span>
              <span className="text-xl font-bold text-amber-600 dark:text-amber-500">{selectedCliente ? currency(selectedCliente.balanceTotal) : ''}</span>
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
                max={selectedCliente?.balanceTotal}
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
            <Button variant="outline" onClick={() => setSelectedCliente(null)} disabled={isPaying}>
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
