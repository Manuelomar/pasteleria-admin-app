"use client"

import { useMemo, useState, useEffect } from "react"
import { Search, Plus, Trash2, Minus, Printer, Save, Eraser } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import Swal from "sweetalert2"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Field, FieldLabel } from "@/components/ui/field"
import { TipoBadge } from "@/components/badges"
import {
  currency,
  type Tipo,
  type Producto,
  type Cliente,
  type VentaItem,
  type MetodoPago,
  type EstadoPago,
} from "@/types"
import { api } from "@/services"
import { AppPagination } from "@/components/ui/app-pagination"
import { Loader } from "@/components/ui/loader"
import { API_URL } from "@/services/api.config"

export function VentasModule() {
  const [search, setSearch] = useState("")
  const [tipo, setTipo] = useState<"productos" | Tipo>("productos")
  const [items, setItems] = useState<VentaItem[]>([])
  const [clienteId, setClienteId] = useState<string>("general")
  const [descuento, setDescuento] = useState("0")
  const [aplicarItbis, setAplicarItbis] = useState(false)
  const [metodoPago, setMetodoPago] = useState<MetodoPago>("efectivo")
  const [estadoPago, setEstadoPago] = useState<EstadoPago>("pagado")
  const [montoPagado, setMontoPagado] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [lastVentaId, setLastVentaId] = useState<string | null>(null)

  const [isLoadingData, setIsLoadingData] = useState(true)
  const [fetchedProductos, setFetchedProductos] = useState<Producto[]>([])
  const [fetchedClientes, setFetchedClientes] = useState<Cliente[]>([])

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(9)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const loadClientes = () => {
    api.clientes.getAll().then(setFetchedClientes).catch(console.error)
  }

  const loadProductos = () => {
    setIsLoadingData(true)
    Promise.all([
      api.productos.getPaged(currentPage, pageSize, search, tipo, "disponible"),
      new Promise(resolve => setTimeout(resolve, 1000))
    ])
      .then(([res]) => {
        setFetchedProductos(res.data)
        setTotalItems(res.total)
        setTotalPages(res.totalPages)
      })
      .catch((err) => {
        console.error(err)
        toast.error("Error cargando productos")
      })
      .finally(() => setIsLoadingData(false))
  }

  useEffect(() => {
    loadClientes()
  }, [])

  useEffect(() => {
    loadProductos()
  }, [currentPage, search, tipo])

  const handleSearchChange = (val: string) => {
    setSearch(val)
    setCurrentPage(1)
  }

  const handleTipoChange = (val: "productos" | Tipo) => {
    setTipo(val)
    setCurrentPage(1)
  }

  const filtered = fetchedProductos

  const addItem = (id: string) => {
    const prod = fetchedProductos.find((p) => p.id === id)
    if (!prod) return
    setItems((prev) => {
      const existing = prev.find((i) => i.productoId === id)
      const currentQty = existing ? existing.cantidad : 0
      
      if (currentQty + 1 > (prod.cantidad || 0)) {
        toast.error(`Solo hay ${prod.cantidad || 0} unidad(es) disponible(s) de ${prod.nombre}`)
        return prev
      }

      if (existing) {
        return prev.map((i) =>
          i.productoId === id ? { ...i, cantidad: i.cantidad + 1 } : i,
        )
      }
      return [
        ...prev,
        { productoId: id, nombre: prod.nombre, precio: prod.precio, cantidad: 1 },
      ]
    })
  }

  const updateQty = (id: string, delta: number) => {
    const prod = fetchedProductos.find((p) => p.id === id)
    if (!prod) return

    setItems((prev) => {
      const existing = prev.find((i) => i.productoId === id)
      if (!existing) return prev

      const newQty = existing.cantidad + delta
      if (delta > 0 && newQty > (prod.cantidad || 0)) {
        toast.error(`Solo hay ${prod.cantidad || 0} unidad(es) disponible(s) de ${prod.nombre}`)
        return prev
      }

      return prev
        .map((i) =>
          i.productoId === id ? { ...i, cantidad: Math.max(0, newQty) } : i,
        )
        .filter((i) => i.cantidad > 0)
    })
  }

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.productoId !== id))
  }

  const subtotal = useMemo(
    () => items.reduce((s, i) => s + i.precio * i.cantidad, 0),
    [items],
  )
  const desc = Number(descuento) || 0
  const imp = aplicarItbis ? (subtotal - desc) * 0.18 : 0
  const total = Math.max(0, subtotal - desc + imp)
  const pagado = estadoPago === "pagado" ? total : Number(montoPagado) || 0
  const balance = Math.max(0, total - pagado)

  const esCredito = clienteId !== "general"

  const limpiar = () => {
    setItems([])
    setDescuento("0")
    setAplicarItbis(false)
    setMontoPagado("")
    setEstadoPago("pagado")
    setMetodoPago("efectivo")
    setClienteId("general")
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/ventas/${id}/print`);
      const html = await res.text();
      
      iframe.onload = () => {
        if (iframe.contentWindow) {
          const originalTitle = document.title;
          const timestamp = new Date().getTime();
          document.title = `Factura_${id}_${timestamp}`;
          iframe.contentWindow.print();
          document.title = originalTitle;
        }
      };
      
      iframe.srcdoc = html;
    } catch (error) {
      console.error("Error al imprimir la factura", error);
    }
  }

  const guardar = async () => {
    if (items.length === 0) {
      toast.error("Agrega al menos un producto a la venta")
      return
    }
    if (estadoPago !== "pagado" && !esCredito) {
      toast.error("Las ventas a crédito requieren un cliente registrado")
      return
    }

    const confirmacion = await Swal.fire({
      title: "¿Está seguro?",
      text: "¿Desea procesar el pago de esta venta?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, procesar",
      cancelButtonText: "No, cancelar",
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#6b7280",
    })

    if (!confirmacion.isConfirmed) {
      return
    }
    
    setIsLoading(true)
    try {
      const payloadItems = items.map(i => ({ ...i }))

      const res = await api.ventas.create({
        clienteId: esCredito ? clienteId : undefined,
        cajeroId: "d69d45cc-d820-4e55-9a8c-a1112b32f22b", // Todo: real session user
        subtotal,
        descuento: desc,
        impuesto: imp,
        total,
        metodoPago,
        estadoPago,
        montoPagado: pagado,
        balance,
        items: payloadItems
      })
      
      if (res && res.data && res.data.id) {
        setLastVentaId(res.data.id)
      }

      const printConfirm = await Swal.fire({
        title: "¡Venta Completada!",
        text: `${res.message || "Operación realizada correctamente"}\n\n¿Desea imprimir la factura?`,
        icon: "success",
        showCancelButton: true,
        confirmButtonText: "Sí, imprimir",
        cancelButtonText: "No, continuar",
        confirmButtonColor: "#e11d48",
        cancelButtonColor: "#6b7280",
      })

      if (printConfirm.isConfirmed && res && res.data && res.data.id) {
        imprimirFactura(res.data.id)
      }

      limpiar()
      loadProductos()
    } catch (err) {
      console.error(err)
      toast.error("Error al guardar la venta")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingData) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_1fr]">
      {/* Columna izquierda: productos */}
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar producto..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <ToggleGroup
          value={[tipo]}
          onValueChange={(v) => v.length > 0 && handleTipoChange(v[0] as typeof tipo)}
          variant="outline"
        >
          <ToggleGroupItem value="productos">Todos</ToggleGroupItem>
          <ToggleGroupItem value="dulce">Dulce</ToggleGroupItem>
          <ToggleGroupItem value="salado">Salado</ToggleGroupItem>
          <ToggleGroupItem value="bebida">Bebida</ToggleGroupItem>
        </ToggleGroup>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {filtered.map((p) => (
            <button
              key={p.id}
              onClick={() => addItem(p.id)}
              className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card text-left transition hover:border-primary hover:shadow-sm"
            >
              <div className="aspect-square w-full overflow-hidden bg-muted">
                <img
                  src={(p.imagen && p.imagen.trim() !== '' && p.imagen !== 'null' && p.imagen !== 'undefined') ? (p.imagen.startsWith('data:') ? p.imagen : API_URL.replace('/api', '') + p.imagen) : ["https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop","https://images.unsplash.com/photo-1557925923-cd4648e211a0?w=400&h=300&fit=crop","https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&h=300&fit=crop","https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400&h=300&fit=crop"][p.id.charCodeAt(0) % 4]}
                  alt={p.nombre}
                  onError={(e) => {
                    e.currentTarget.src = ["https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop","https://images.unsplash.com/photo-1557925923-cd4648e211a0?w=400&h=300&fit=crop","https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&h=300&fit=crop","https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400&h=300&fit=crop"][p.id.charCodeAt(0) % 4];
                  }}
                  className="size-full object-cover transition group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col gap-1 p-2.5">
                <span className="line-clamp-1 text-sm font-medium text-foreground">{p.nombre}</span>
                <span className="text-[10px] text-muted-foreground">Stock: {p.cantidad ?? 0}</span>
                <div className="flex items-center justify-between gap-1 mt-0.5">
                  <span className="text-sm font-semibold text-primary">{currency(p.precio)}</span>
                  <Plus className="size-4 text-muted-foreground group-hover:text-primary" />
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Paginación */}
        <AppPagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={totalItems}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemName="productos"
        />
      </div>

      {/* Columna derecha: factura */}
      <Card className="h-fit xl:sticky xl:top-20">
        <CardHeader>
          <CardTitle>Factura actual</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Field>
            <FieldLabel>Cliente</FieldLabel>
            <Select value={clienteId} onValueChange={(v) => v !== null && setClienteId(v)}>
              <SelectTrigger className="w-full">
                <SelectValue>
                  {clienteId === "general"
                    ? "Venta sin cliente registrado"
                    : fetchedClientes.find((c) => c.id === clienteId)?.nombre || "Seleccione un cliente"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">Venta sin cliente registrado</SelectItem>
                {fetchedClientes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Separator />

          {items.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No hay productos agregados. Selecciona productos del catálogo.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {items.map((i) => {
                const prod = fetchedProductos.find(p => p.id === i.productoId)
                let displayPrice = i.precio
                if (prod && metodoPago === "uberEats" && prod.precioUber !== undefined) {
                  displayPrice = prod.precioUber
                }
                return (
                  <div key={i.productoId} className="flex items-center gap-2 rounded-lg border border-border p-2">
                    <div className="flex flex-1 flex-col">
                      <span className="text-sm font-medium text-foreground">{i.nombre}</span>
                      <span className="text-xs text-muted-foreground">{currency(displayPrice)} c/u</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="icon" className="size-7" onClick={() => updateQty(i.productoId, -1)}>
                        <Minus className="size-3" />
                      </Button>
                      <span className="w-6 text-center text-sm font-medium">{i.cantidad}</span>
                      <Button variant="outline" size="icon" className="size-7" onClick={() => updateQty(i.productoId, 1)}>
                        <Plus className="size-3" />
                      </Button>
                    </div>
                    <span className="w-16 text-right text-sm font-semibold text-foreground">
                      {currency(displayPrice * i.cantidad)}
                    </span>
                    <Button variant="ghost" size="icon" className="size-7 text-primary" onClick={() => removeItem(i.productoId)}>
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                )
              })}
            </div>
          )}

          <Separator />

          <div className="flex flex-col gap-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{currency(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">Descuento</span>
              <Input
                type="number"
                value={descuento}
                onChange={(e) => setDescuento(e.target.value)}
                className="h-8 w-24 text-right"
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">Aplicar ITBIS (18%)</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{currency(imp)}</span>
                <Switch
                  checked={aplicarItbis}
                  onCheckedChange={setAplicarItbis}
                />
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-2">
              <span className="font-heading text-base font-semibold">Total</span>
              <span className="font-heading text-lg font-semibold text-primary">{currency(total)}</span>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-3">
            <Field>
              <FieldLabel>Método de pago</FieldLabel>
              <Select value={metodoPago} onValueChange={(v) => v !== null && setMetodoPago(v as MetodoPago)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="efectivo">Efectivo</SelectItem>
                  <SelectItem value="tarjeta">Tarjeta</SelectItem>
                  <SelectItem value="transferencia">Transferencia</SelectItem>
                  <SelectItem value="uberEats">UberEats</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel>Estado de pago</FieldLabel>
              <Select value={estadoPago} onValueChange={(v) => v !== null && setEstadoPago(v as EstadoPago)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pagado">Pagado</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="parcial">Parcial</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          {estadoPago !== "pagado" ? (
            <>
              <Field>
                <FieldLabel>Monto pagado</FieldLabel>
                <Input
                  type="number"
                  value={montoPagado}
                  onChange={(e) => setMontoPagado(e.target.value)}
                  placeholder="0.00"
                />
              </Field>
              <div className="flex items-center justify-between rounded-lg bg-secondary p-3 text-sm">
                <span className="text-muted-foreground">Balance pendiente</span>
                <span className="font-semibold text-primary">{currency(balance)}</span>
              </div>
              {!esCredito ? (
                <p className="text-xs text-primary">
                  Selecciona un cliente registrado para ventas a crédito.
                </p>
              ) : null}
            </>
          ) : null}

          <div className="flex flex-col gap-2">
            <Button onClick={guardar} disabled={isLoading || items.length === 0}>
              <Save data-icon="inline-start" />
              {isLoading ? "Procesando..." : "Procesar Pago"}
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  if (lastVentaId) {
                    imprimirFactura(lastVentaId)
                  } else {
                    toast.error("No hay ninguna venta reciente para imprimir")
                  }
                }}
              >
                <Printer data-icon="inline-start" />
                Imprimir
              </Button>
              <Button variant="outline" onClick={limpiar}>
                <Eraser data-icon="inline-start" />
                Limpiar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
