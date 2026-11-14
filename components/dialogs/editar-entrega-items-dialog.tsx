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
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Trash2, Plus, Minus, AlertCircle, Package } from "lucide-react"
import { api } from "@/services"
import type { Entrega } from "@/types"
import { currency, formatDate } from "@/lib/utils"
import Swal from "sweetalert2"

interface EditableItem {
  id: string
  productoId: string
  nombre: string
  cantidad: number
  precioCosto: number
  eliminado?: boolean
}

interface EditarEntregaItemsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entrega: Entrega | null
  onSaved?: () => void
}

export function EditarEntregaItemsDialog({
  open,
  onOpenChange,
  entrega,
  onSaved,
}: EditarEntregaItemsDialogProps) {
  const [items, setItems] = useState<EditableItem[]>([])
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (open && entrega) {
      const initialItems: EditableItem[] = (entrega.items || []).map((i) => ({
        id: i.id,
        productoId: i.productoId || i.id,
        nombre: i.producto?.nombre || i.nombre || "Producto desconocido",
        cantidad: Number(i.cantidad || 1),
        precioCosto: Number(i.precioCosto || 0),
        eliminado: false,
      }))
      setItems(initialItems)
    }
  }, [open, entrega])

  const handleUpdateCantidad = (productoId: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.productoId === productoId) {
          const nuevaCantidad = Math.max(1, item.cantidad + delta)
          return { ...item, cantidad: nuevaCantidad }
        }
        return item
      })
    )
  }

  const handleSetCantidad = (productoId: string, val: string) => {
    const num = parseInt(val, 10)
    if (isNaN(num)) return
    setItems((prev) =>
      prev.map((item) => {
        if (item.productoId === productoId) {
          return { ...item, cantidad: Math.max(1, num) }
        }
        return item
      })
    )
  }

  const handleToggleEliminar = (productoId: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.productoId === productoId) {
          return { ...item, eliminado: !item.eliminado }
        }
        return item
      })
    )
  }

  const activeItems = items.filter((i) => !i.eliminado)
  const nuevoTotal = activeItems.reduce(
    (acc, item) => acc + item.cantidad * item.precioCosto,
    0
  )
  const totalOriginal = Number(entrega?.totalCosto || 0)
  const diferencia = nuevoTotal - totalOriginal

  const handleGuardar = async () => {
    if (!entrega) return

    if (activeItems.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Entrega vacía",
        text: "La entrega debe contener al menos un producto. Si deseas anularla por completo, utiliza la opción 'Descartar'.",
        confirmButtonColor: "#e11d48",
      })
      return
    }

    const quitados = items.filter((i) => i.eliminado)
    const modificados = items.filter((i) => {
      if (i.eliminado) return false
      const orig = entrega.items.find((o) => (o.productoId || o.id) === i.productoId)
      return orig && Number(orig.cantidad) !== i.cantidad
    })

    if (quitados.length === 0 && modificados.length === 0) {
      onOpenChange(false)
      return
    }

    let detalleCambios = `<div class="text-left text-xs space-y-1 mt-2">`
    if (quitados.length > 0) {
      detalleCambios += `<p class="font-semibold text-rose-500">Artículos a quitar de la entrega (${quitados.length}):</p><ul class="list-disc pl-5">`
      quitados.forEach((q) => {
        detalleCambios += `<li>${q.nombre} (cant: ${q.cantidad})</li>`
      })
      detalleCambios += `</ul>`
    }
    if (modificados.length > 0) {
      detalleCambios += `<p class="font-semibold text-amber-500 mt-2">Cantidades modificadas (${modificados.length}):</p><ul class="list-disc pl-5">`
      modificados.forEach((m) => {
        const orig = entrega.items.find((o) => (o.productoId || o.id) === m.productoId)
        detalleCambios += `<li>${m.nombre}: de ${orig?.cantidad} a ${m.cantidad}</li>`
      })
      detalleCambios += `</ul>`
    }
    detalleCambios += `<div class="mt-3 font-medium">Nuevo total a pagar: <b>${currency(nuevoTotal)}</b></div></div>`

    const confirmResult = await Swal.fire({
      title: "¿Confirmar cambios en la entrega?",
      html: `Se actualizarán los artículos y el monto de la entrega.<br/>${detalleCambios}`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, guardar cambios",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#64748b",
    })

    if (!confirmResult.isConfirmed) return

    setIsSaving(true)
    try {
      const payload = activeItems.map((i) => ({
        id: i.id,
        productoId: i.productoId,
        cantidad: i.cantidad,
      }))

      await api.entregas.updateItems(entrega.id, payload)

      Swal.fire({
        icon: "success",
        title: "Entrega actualizada",
        text: `Los artículos y el total fueron actualizados exitosamente. Total: ${currency(nuevoTotal)}`,
        confirmButtonColor: "#e11d48",
      })

      if (onSaved) onSaved()
      onOpenChange(false)
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Error al actualizar los artículos de la entrega"
      console.error(err)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMsg,
        confirmButtonColor: "#e11d48",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Package className="size-5 text-primary" />
            <DialogTitle>Modificar Artículos de la Entrega</DialogTitle>
          </div>
          <DialogDescription>
            {entrega?.proveedor
              ? `Proveedor: ${entrega.proveedor.nombre || entrega.proveedor.name} • Prevista: ${formatDate(entrega.fechaPrevista)}`
              : "Ajusta las cantidades o retira productos que no deban pagarse."}
          </DialogDescription>
        </DialogHeader>

        {entrega?.agregadoAlStock && (
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2.5">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Entrega ya añadida al inventario:</span> Cualquier
              artículo que elimines o cantidad que reduzcas se descontará automáticamente del
              inventario para mantener las existencias exactas.
            </div>
          </div>
        )}

        <div className="rounded-md border border-border/60 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Producto</TableHead>
                <TableHead className="text-right">Costo unit.</TableHead>
                <TableHead className="text-center w-36">Cantidad</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
                <TableHead className="text-center w-16">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow
                  key={item.productoId}
                  className={
                    item.eliminado
                      ? "bg-rose-500/10 line-through text-muted-foreground opacity-60"
                      : undefined
                  }
                >
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">{item.nombre}</span>
                      {item.eliminado && (
                        <span className="text-[11px] font-semibold text-rose-500 no-underline">
                          Marcado para quitar
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {currency(item.precioCosto)}
                  </TableCell>
                  <TableCell className="text-center">
                    {!item.eliminado ? (
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-7"
                          onClick={() => handleUpdateCantidad(item.productoId, -1)}
                          disabled={item.cantidad <= 1 || isSaving}
                          type="button"
                        >
                          <Minus className="size-3" />
                        </Button>
                        <Input
                          type="number"
                          min={1}
                          value={item.cantidad}
                          onChange={(e) => handleSetCantidad(item.productoId, e.target.value)}
                          className="w-14 h-7 text-center font-bold px-1"
                          disabled={isSaving}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-7"
                          onClick={() => handleUpdateCantidad(item.productoId, 1)}
                          disabled={isSaving}
                          type="button"
                        >
                          <Plus className="size-3" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-sm font-semibold text-rose-500">0</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold text-sm">
                    {item.eliminado
                      ? currency(0)
                      : currency(item.cantidad * item.precioCosto)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant={item.eliminado ? "outline" : "ghost"}
                      size="icon"
                      className={
                        item.eliminado
                          ? "size-8 text-muted-foreground hover:text-foreground"
                          : "size-8 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                      }
                      onClick={() => handleToggleEliminar(item.productoId)}
                      disabled={isSaving}
                      title={item.eliminado ? "Restaurar producto" : "Quitar producto de la entrega"}
                      type="button"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Resumen del Monto */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-lg bg-muted/30 border border-border/50">
          <div className="text-xs text-muted-foreground space-y-0.5">
            <p>
              Total original: <span className="font-semibold">{currency(totalOriginal)}</span>
            </p>
            {diferencia !== 0 && (
              <p>
                Diferencia:{" "}
                <Badge
                  variant={diferencia < 0 ? "default" : "destructive"}
                  className="font-mono text-xs"
                >
                  {diferencia > 0 ? `+${currency(diferencia)}` : currency(diferencia)}
                </Badge>
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs font-medium text-muted-foreground uppercase">
              Nuevo Total a Pagar
            </p>
            <p className="text-xl font-heading font-bold text-primary">
              {currency(nuevoTotal)}
            </p>
          </div>
        </div>

        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleGuardar} disabled={isSaving || activeItems.length === 0}>
            {isSaving ? "Guardando..." : "Guardar cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

