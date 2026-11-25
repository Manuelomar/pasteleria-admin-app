"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PackagePlus, Truck, Building2, DollarSign, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { api } from "@/services"
import { currency, type Producto, type Usuario, type Sucursal, type EstadoPagoEntrega } from "@/types"
import { API_URL } from "@/services/api.config"

export interface IngresoStockDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  producto: Producto | null
  productos?: Producto[]
  sucursales: Sucursal[]
  providers: Usuario[]
  currentUser?: Usuario | null
  defaultSucursalId?: string
  onSuccess?: () => void
}

export function IngresoStockDialog({
  open,
  onOpenChange,
  producto,
  productos,
  sucursales,
  providers,
  currentUser,
  defaultSucursalId,
  onSuccess,
}: IngresoStockDialogProps) {
  const isSuperAdmin = currentUser?.rol === "superadmin"

  const [activeProduct, setActiveProduct] = useState<Producto | null>(producto)
  const [sucursalId, setSucursalId] = useState<string>("")
  const [proveedorId, setProveedorId] = useState<string>("")
  const [cantidad, setCantidad] = useState<string>("")
  const [precioCosto, setPrecioCosto] = useState<string>("")
  const [estadoPago, setEstadoPago] = useState<EstadoPagoEntrega>("pendiente_pago")
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  useEffect(() => {
    if (open) {
      const prod = producto || (productos && productos.length > 0 ? productos[0] : null)
      setActiveProduct(prod)

      if (prod) {
        const initialSucursalId =
          prod.sucursalId ||
          (defaultSucursalId && defaultSucursalId !== "todas" ? defaultSucursalId : "") ||
          currentUser?.sucursalId ||
          (sucursales.length > 0 ? sucursales[0].id : "")

        setSucursalId(initialSucursalId)
        setProveedorId(providers.length > 0 ? providers[0].id : "")
        setCantidad("")
        setPrecioCosto(
          prod.precioCosto !== undefined && prod.precioCosto !== null
            ? String(prod.precioCosto)
            : ""
        )
        setEstadoPago("pendiente_pago")
      }
    }
  }, [open, producto, productos, defaultSucursalId, currentUser, sucursales, providers])

  const handleProductChange = (prodId: string) => {
    const found = productos?.find((p) => p.id === prodId)
    if (found) {
      setActiveProduct(found)
      if (found.sucursalId) {
        setSucursalId(found.sucursalId)
      }
      setPrecioCosto(
        found.precioCosto !== undefined && found.precioCosto !== null
          ? String(found.precioCosto)
          : ""
      )
    }
  }

  if (!activeProduct) return null

  const parsedCantidad = parseInt(cantidad, 10) || 0
  const parsedCosto = parseFloat(precioCosto) || 0
  const totalCosto = parsedCantidad * parsedCosto

  const handleSubmit = async () => {
    if (!sucursalId) {
      toast.error("Debes seleccionar una sucursal de destino")
      return
    }
    if (!proveedorId) {
      toast.error("Debes seleccionar el proveedor que entrega la mercancía")
      return
    }
    if (parsedCantidad <= 0) {
      toast.error("Ingresa una cantidad válida mayor a 0")
      return
    }

    setIsSubmitting(true)
    try {
      await api.entregas.ingresoRapido({
        proveedorId,
        sucursalId,
        productoId: activeProduct.id,
        cantidad: parsedCantidad,
        precioCosto: parsedCosto > 0 ? parsedCosto : undefined,
        estadoPago,
      })

      toast.success(
        `Se ingresaron ${parsedCantidad} unidades de "${activeProduct.nombre}" al stock y se registró la entrega correctamente.`
      )
      if (onSuccess) onSuccess()
      onOpenChange(false)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al ingresar stock"
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const sucursalNombre =
    sucursales.find((s) => s.id === sucursalId)?.nombre ||
    activeProduct.sucursalNombre ||
    "Sucursal asignada"

  const defaultImg =
    "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop"
  const imgUrl =
    activeProduct.imagen && activeProduct.imagen.trim() !== "" && activeProduct.imagen !== "null"
      ? activeProduct.imagen.startsWith("data:")
        ? activeProduct.imagen
        : API_URL.replace("/api", "") + activeProduct.imagen
      : defaultImg

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-600">
              <PackagePlus className="size-5" />
            </div>
            <div>
              <DialogTitle>Ingreso Rápido de Stock</DialogTitle>
              <DialogDescription>
                Registra la entrega del proveedor y suma el stock a la sucursal.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Selector de producto si hay múltiples disponibles */}
        {productos && productos.length > 1 && (
          <Field className="mb-1">
            <FieldLabel className="text-xs font-semibold">Producto</FieldLabel>
            <Select
              value={activeProduct.id}
              onValueChange={(val) => val && handleProductChange(val)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar producto..." />
              </SelectTrigger>
              <SelectContent className="max-h-56">
                {productos.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.nombre} {p.sucursalNombre ? `(${p.sucursalNombre})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        )}

        {/* Resumen del producto seleccionado */}
        <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/40">
          <img
            src={imgUrl}
            alt={activeProduct.nombre}
            className="size-14 rounded-md object-cover border"
          />
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm truncate">{activeProduct.nombre}</h4>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              <span>Stock actual: <strong className="text-foreground">{activeProduct.cantidad ?? 0}</strong></span>
              <span>•</span>
              <span>Costo actual: <strong className="text-foreground">{currency(activeProduct.precioCosto || 0)}</strong></span>
            </div>
            <div className="text-[11px] text-muted-foreground truncate mt-0.5">
              📍 {sucursalNombre}
            </div>
          </div>
        </div>

        <FieldGroup className="gap-3 py-1">
          {/* Sucursal de destino */}
          <Field>
            <FieldLabel className="flex items-center gap-1.5 text-xs font-semibold">
              <Building2 className="size-3.5" />
              Sucursal de Destino
            </FieldLabel>
            {isSuperAdmin ? (
              <Select value={sucursalId} onValueChange={(val) => val && setSucursalId(val)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccione sucursal..." />
                </SelectTrigger>
                <SelectContent>
                  {sucursales.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.nombre} ({s.codigo})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="text-sm p-2 rounded-md bg-muted border">
                {currentUser?.sucursalNombre || sucursalNombre}
              </div>
            )}
          </Field>

          {/* Proveedor que entrega */}
          <Field>
            <FieldLabel className="flex items-center gap-1.5 text-xs font-semibold">
              <Truck className="size-3.5" />
              Proveedor
            </FieldLabel>
            <Select value={proveedorId} onValueChange={(val) => val && setProveedorId(val)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar proveedor..." />
              </SelectTrigger>
              <SelectContent>
                {providers.map((prov) => (
                  <SelectItem key={prov.id} value={prov.id}>
                    {prov.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {/* Cantidad y Costo */}
          <div className="grid grid-cols-2 gap-3">
            <Field>
              <FieldLabel className="text-xs font-semibold">Cantidad a Ingresar</FieldLabel>
              <Input
                type="number"
                min="1"
                placeholder="Ej. 10"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                autoFocus
              />
            </Field>

            <Field>
              <FieldLabel className="flex items-center gap-1 text-xs font-semibold">
                <DollarSign className="size-3.5" />
                Costo Unitario
              </FieldLabel>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={precioCosto}
                onChange={(e) => setPrecioCosto(e.target.value)}
              />
            </Field>
          </div>

          {/* Estado de pago */}
          <Field>
            <FieldLabel className="text-xs font-semibold">Estado de Pago de la Entrega</FieldLabel>
            <Select
              value={estadoPago}
              onValueChange={(val) => val && setEstadoPago(val as EstadoPagoEntrega)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pendiente_pago">
                  Pendiente de Pago (Cuentas por Pagar)
                </SelectItem>
                <SelectItem value="pagado">
                  Pagado al Contado
                </SelectItem>
              </SelectContent>
            </Select>
          </Field>

          {/* Total calculado */}
          {parsedCantidad > 0 && parsedCosto > 0 && (
            <div className="flex items-center justify-between p-2.5 rounded-md bg-primary/5 border border-primary/20 text-xs">
              <span className="text-muted-foreground font-medium">Total de la Entrega:</span>
              <span className="text-primary font-bold text-sm">{currency(totalCosto)}</span>
            </div>
          )}
        </FieldGroup>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={handleSubmit}
            disabled={isSubmitting || parsedCantidad <= 0 || !proveedorId || !sucursalId}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Registrando...
              </>
            ) : (
              "Ingresar al Stock"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
