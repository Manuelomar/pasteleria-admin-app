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
import { Switch } from "@/components/ui/switch"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Copy, AlertCircle } from "lucide-react"
import { api } from "@/services"
import type { Sucursal } from "@/types"
import Swal from "sweetalert2"

export function ClonarCatalogoDialog({
  open,
  onOpenChange,
  onCloned,
  defaultDestinoId,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  onCloned?: () => void
  defaultDestinoId?: string
}) {
  const [sucursales, setSucursales] = useState<Sucursal[]>([])
  const [origenId, setOrigenId] = useState<string>("")
  const [destinoId, setDestinoId] = useState<string>("")
  const [clonarStock, setClonarStock] = useState<boolean>(false)
  const [isCloning, setIsCloning] = useState<boolean>(false)

  useEffect(() => {
    if (open) {
      api.sucursales.getAll().then((list) => {
        setSucursales(list)
        if (list.length >= 2) {
          // Por defecto el origen es la sucursal 1 (código AR o la primera)
          const almaRosa = list.find((s) => s.codigo === "AR") || list[0]
          setOrigenId(almaRosa.id)

          if (defaultDestinoId && defaultDestinoId !== almaRosa.id) {
            setDestinoId(defaultDestinoId)
          } else {
            const otra = list.find((s) => s.id !== almaRosa.id)
            if (otra) setDestinoId(otra.id)
          }
        }
      }).catch(console.error)
      setClonarStock(false)
    }
  }, [open, defaultDestinoId])

  const handleClonar = async () => {
    if (!origenId) {
      Swal.fire({
        icon: "warning",
        title: "Selecciona el origen",
        text: "Debes seleccionar la sucursal de donde se copiarán los productos.",
        confirmButtonColor: "#e11d48",
      cancelButtonColor: "#64748b",
      })
      return
    }

    if (!destinoId) {
      Swal.fire({
        icon: "warning",
        title: "Selecciona el destino",
        text: "Debes seleccionar la sucursal que recibirá los productos.",
        confirmButtonColor: "#e11d48",
      cancelButtonColor: "#64748b",
      })
      return
    }

    if (origenId === destinoId) {
      Swal.fire({
        icon: "error",
        title: "Sucursales iguales",
        text: "La sucursal origen y la sucursal destino deben ser diferentes.",
        confirmButtonColor: "#e11d48",
      cancelButtonColor: "#64748b",
      })
      return
    }

    const origen = sucursales.find((s) => s.id === origenId)
    const destino = sucursales.find((s) => s.id === destinoId)

    const confirmResult = await Swal.fire({
      title: "¿Confirmar clonación?",
      html: `Se copiará el catálogo completo de <b>"${origen?.nombre}"</b> hacia <b>"${destino?.nombre}"</b>.<br/><br/><small class="text-muted-foreground">Cada sucursal manejará sus propios precios y stock de manera independiente después de la clonación.</small>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, clonar catálogo",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#64748b",
    })

    if (!confirmResult.isConfirmed) return

    setIsCloning(true)
    try {
      const res = await api.sucursales.clonarCatalogo(destinoId, origenId, clonarStock)
      Swal.fire({
        icon: "success",
        title: "Catálogo Clonado",
        text: res.message || `Se clonaron ${res.count} productos exitosamente.`,
        confirmButtonColor: "#e11d48",
      cancelButtonColor: "#64748b",
      })
      if (onCloned) onCloned()
      onOpenChange(false)
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Error al clonar el catálogo"
      Swal.fire({
        icon: "error",
        title: "Error al clonar",
        text: errorMsg,
        confirmButtonColor: "#e11d48",
      cancelButtonColor: "#64748b",
      })
    } finally {
      setIsCloning(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Copy className="size-5 text-primary" />
            <DialogTitle>Clonar Catálogo de Productos</DialogTitle>
          </div>
          <DialogDescription>
            Copia exactamente todos los productos de una sucursal existente hacia otra nueva sucursal.
          </DialogDescription>
        </DialogHeader>

        <FieldGroup className="py-2">
          <Field>
            <FieldLabel>Sucursal Origen (Copiar desde)</FieldLabel>
            <Select value={origenId} onValueChange={(val) => setOrigenId(val ?? "")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar origen..." />
              </SelectTrigger>
              <SelectContent>
                {sucursales.map((s) => (
                  <SelectItem key={s.id} value={s.id} disabled={s.id === destinoId}>
                    {s.nombre} ({s.codigo})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel>Sucursal Destino (Copiar hacia)</FieldLabel>
            <Select value={destinoId} onValueChange={(val) => setDestinoId(val ?? "")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar destino..." />
              </SelectTrigger>
              <SelectContent>
                {sucursales.map((s) => (
                  <SelectItem key={s.id} value={s.id} disabled={s.id === origenId}>
                    {s.nombre} ({s.codigo})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field orientation="horizontal" className="items-center justify-between pt-2">
            <div className="space-y-0.5">
              <FieldLabel htmlFor="clonar-stock">¿Copiar cantidad de stock?</FieldLabel>
              <p className="text-xs text-muted-foreground">
                Si está desactivado, los productos en la nueva sucursal comenzarán con stock 0.
              </p>
            </div>
            <Switch id="clonar-stock" checked={clonarStock} onCheckedChange={setClonarStock} />
          </Field>
        </FieldGroup>

        <div className="rounded-md border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <span>
            Los productos se clonarán como independientes. Cualquier cambio posterior en precios o recetas en una sucursal no afectará a la otra.
          </span>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isCloning}>
            Cancelar
          </Button>
          <Button onClick={handleClonar} disabled={isCloning || !origenId || !destinoId}>
            {isCloning ? "Clonando..." : "Clonar Catálogo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
