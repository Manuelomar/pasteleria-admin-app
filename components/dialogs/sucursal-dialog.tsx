"use client"

import { useEffect, useState } from "react"
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
import { Switch } from "@/components/ui/switch"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Copy } from "lucide-react"
import type { Sucursal, CreateSucursalInput } from "@/types"
import Swal from "sweetalert2"
import { api } from "@/services"

interface SucursalDialogProps {
  open: boolean
  onOpenChange: (o: boolean) => void
  sucursal: Sucursal | null
  onSaved?: (nuevaSucursal: Sucursal) => void
}

export function SucursalDialog({
  open,
  onOpenChange,
  sucursal,
  onSaved,
}: SucursalDialogProps) {
  const [nombre, setNombre] = useState("")
  const [codigo, setCodigo] = useState("")
  const [direccion, setDireccion] = useState("")
  const [telefono, setTelefono] = useState("")
  const [activa, setActiva] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Opciones para clonar catálogo al crear nueva sucursal
  const [sucursalesDisponibles, setSucursalesDisponibles] = useState<Sucursal[]>([])
  const [clonarCatalogo, setClonarCatalogo] = useState(false)
  const [origenId, setOrigenId] = useState("")
  const [clonarStock, setClonarStock] = useState(false)

  useEffect(() => {
    if (open) {
      setNombre(sucursal?.nombre ?? "")
      setCodigo(sucursal?.codigo ?? "")
      setDireccion(sucursal?.direccion ?? "")
      setTelefono(sucursal?.telefono ?? "")
      setActiva(sucursal?.activa ?? true)
      setClonarCatalogo(false)
      setClonarStock(false)

      if (!sucursal) {
        api.sucursales
          .getAll()
          .then((list) => {
            setSucursalesDisponibles(list)
            if (list.length > 0) {
              const defaultOrig = list.find((s) => s.codigo === "AR") || list[0]
              setOrigenId(defaultOrig.id)
            }
          })
          .catch(console.error)
      } else {
        setSucursalesDisponibles([])
      }
    }
  }, [open, sucursal])

  const handleSave = async () => {
    if (!nombre.trim()) {
      Swal.fire({
        icon: "error",
        title: "Error de validación",
        text: "El nombre de la sucursal es requerido",
        confirmButtonColor: "#e11d48",
      })
      return
    }

    if (!codigo.trim()) {
      Swal.fire({
        icon: "error",
        title: "Error de validación",
        text: "El código de la sucursal es requerido (ej. AR, LJ)",
        confirmButtonColor: "#e11d48",
      })
      return
    }

    if (codigo.trim().length > 5) {
      Swal.fire({
        icon: "error",
        title: "Error de validación",
        text: "El código debe tener máximo 5 caracteres",
        confirmButtonColor: "#e11d48",
      })
      return
    }

    if (!sucursal && clonarCatalogo && !origenId) {
      Swal.fire({
        icon: "warning",
        title: "Selecciona el origen",
        text: "Debes seleccionar la sucursal de donde se copiarán los productos.",
        confirmButtonColor: "#e11d48",
      })
      return
    }

    setIsSaving(true)
    try {
      const data: CreateSucursalInput = {
        nombre: nombre.trim(),
        codigo: codigo.trim().toUpperCase(),
        direccion: direccion.trim() || undefined,
        telefono: telefono.trim() || undefined,
        activa,
      }

      let savedSucursal: Sucursal

      if (sucursal) {
        savedSucursal = await api.sucursales.update(sucursal.id, data)
        Swal.fire({
          icon: "success",
          title: "Éxito",
          text: "Sucursal actualizada",
          confirmButtonColor: "#e11d48",
        })
      } else {
        savedSucursal = await api.sucursales.create(data)

        let extraClonarMsg = ""
        if (clonarCatalogo && origenId) {
          try {
            const clonarRes = await api.sucursales.clonarCatalogo(
              savedSucursal.id,
              origenId,
              clonarStock
            )
            extraClonarMsg = ` y se clonaron ${clonarRes.count} productos`
          } catch (clonarErr: unknown) {
            console.error("Error al clonar catálogo inicial:", clonarErr)
            extraClonarMsg = `, pero hubo un detalle al clonar los productos: ${
              clonarErr instanceof Error ? clonarErr.message : "Error desconocido"
            }`
          }
        }

        Swal.fire({
          icon: "success",
          title: "Éxito",
          text: `Sucursal "${savedSucursal.nombre}" creada exitosamente${extraClonarMsg}.`,
          confirmButtonColor: "#e11d48",
        })
      }

      if (onSaved) onSaved(savedSucursal)
      onOpenChange(false)
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : "Error al guardar la sucursal"
      console.error(error)
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
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{sucursal ? "Editar sucursal" : "Nueva sucursal"}</DialogTitle>
          <DialogDescription>
            {sucursal
              ? "Modifica los datos de la sucursal."
              : "Registra una nueva sucursal para el negocio."}
          </DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="suc-nombre">Nombre</FieldLabel>
            <Input
              id="suc-nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Alma Rosa"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="suc-codigo">Código (prefijo para facturas)</FieldLabel>
            <Input
              id="suc-codigo"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              placeholder="Ej. AR"
              maxLength={5}
              disabled={!!sucursal}
            />
            {!sucursal && (
              <p className="text-xs text-muted-foreground mt-1">
                Código único de 2-5 caracteres. No se puede cambiar después.
              </p>
            )}
          </Field>
          <Field>
            <FieldLabel htmlFor="suc-direccion">Dirección (opcional)</FieldLabel>
            <Input
              id="suc-direccion"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              placeholder="Ej. Calle Principal #123"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="suc-telefono">Teléfono (opcional)</FieldLabel>
            <Input
              id="suc-telefono"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="Ej. 809-555-1234"
            />
          </Field>
          <Field orientation="horizontal" className="items-center justify-between">
            <FieldLabel htmlFor="suc-activa">Sucursal activa</FieldLabel>
            <Switch id="suc-activa" checked={activa} onCheckedChange={setActiva} />
          </Field>

          {!sucursal && sucursalesDisponibles.length > 0 && (
            <div className="rounded-lg border border-border/60 bg-muted/30 p-3 flex flex-col gap-3 mt-1">
              <Field orientation="horizontal" className="items-center justify-between">
                <div className="space-y-0.5">
                  <FieldLabel htmlFor="suc-clonar" className="font-medium text-sm flex items-center gap-1.5 cursor-pointer">
                    <Copy className="size-3.5 text-primary" />
                    Clonar catálogo de productos
                  </FieldLabel>
                  <p className="text-xs text-muted-foreground">
                    Copia todos los productos de otra sucursal a esta nueva.
                  </p>
                </div>
                <Switch
                  id="suc-clonar"
                  checked={clonarCatalogo}
                  onCheckedChange={setClonarCatalogo}
                />
              </Field>

              {clonarCatalogo && (
                <div className="flex flex-col gap-3 pt-2 border-t border-border/50">
                  <Field>
                    <FieldLabel>Copiar productos desde</FieldLabel>
                    <Select value={origenId} onValueChange={(val) => setOrigenId(val ?? "")}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar origen..." />
                      </SelectTrigger>
                      <SelectContent>
                        {sucursalesDisponibles.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.nombre} ({s.codigo})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field orientation="horizontal" className="items-center justify-between">
                    <div className="space-y-0.5">
                      <FieldLabel htmlFor="suc-clonar-stock" className="text-xs cursor-pointer">
                        ¿Copiar cantidad de stock?
                      </FieldLabel>
                      <p className="text-[11px] text-muted-foreground">
                        Si está apagado, empezarán con stock 0.
                      </p>
                    </div>
                    <Switch
                      id="suc-clonar-stock"
                      checked={clonarStock}
                      onCheckedChange={setClonarStock}
                    />
                  </Field>
                </div>
              )}
            </div>
          )}
        </FieldGroup>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Guardando..." : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
