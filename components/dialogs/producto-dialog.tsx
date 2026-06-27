"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
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
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Producto, Usuario } from "@/lib/data"
import { api } from "@/lib/api"

const categorias = [
  "Pasteles",
  "Bizcochos",
  "Tres leches",
  "Galletas",
  "Brownies",
  "Postres",
  "Empanadas",
  "Quipes",
  "Croquetas",
  "Café",
  "Batidas",
  "Malteadas",
]

export function ProductoDialog({
  open,
  onOpenChange,
  producto,
  onSaved,
  currentUser,
  defaultProveedorId,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  producto: Producto | null
  onSaved?: () => void
  currentUser?: Usuario | null
  defaultProveedorId?: string | null
}) {
  const [nombre, setNombre] = useState("")
  const [categoria, setCategoria] = useState("Pasteles")
  const [tipo, setTipo] = useState("dulce")
  const [precio, setPrecio] = useState("")
  const [precioCosto, setPrecioCosto] = useState("")
  const [cantidad, setCantidad] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [disponible, setDisponible] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setNombre(producto?.nombre ?? "")
      setCategoria(producto?.categoria ?? "Pasteles")
      setTipo(producto?.tipo ?? "dulce")
      setPrecio(producto && producto.precio !== undefined ? String(producto.precio) : "")
      setPrecioCosto(producto && producto.precioCosto !== undefined ? String(producto.precioCosto) : "")
      setCantidad(producto?.cantidad !== undefined ? String(producto.cantidad) : "0")
      setDescripcion(producto?.descripcion ?? "")
      setDisponible(producto?.disponible ?? true)
    }
  }, [open, producto])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const data: any = {
        nombre,
        categoria,
        tipo: tipo as "dulce" | "salado" | "bebida",
        precio: parseFloat(precio) || 0,
        precioCosto: parseFloat(precioCosto) || 0,
        cantidad: parseInt(cantidad) || 0,
        descripcion,
        disponible,
      }
      
      if (defaultProveedorId && !producto) {
        data.proveedorId = defaultProveedorId
      }
      
      if (producto) {
        await api.productos.update(producto.id, data)
        toast.success("Producto actualizado")
      } else {
        await api.productos.create(data)
        toast.success("Producto creado")
      }
      
      if (onSaved) onSaved()
      onOpenChange(false)
    } catch (error) {
      console.error(error)
      toast.error("Error al guardar el producto")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{producto ? "Editar producto" : "Nuevo producto"}</DialogTitle>
          <DialogDescription>
            Completa la información del producto del catálogo.
          </DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="prod-nombre">Nombre</FieldLabel>
            <Input
              id="prod-nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Pastel de chocolate"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Categoría</FieldLabel>
              <Select value={categoria} onValueChange={(v) => v !== null && setCategoria(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel>Tipo</FieldLabel>
              <Select value={tipo} onValueChange={(v) => v !== null && setTipo(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dulce">Dulce</SelectItem>
                  <SelectItem value="salado">Salado</SelectItem>
                  <SelectItem value="bebida">Bebida</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {(currentUser?.rol === "admin" || currentUser?.rol !== "proveedor") && (
              <Field>
                <FieldLabel htmlFor="prod-precio">Precio de Venta</FieldLabel>
                <Input
                  id="prod-precio"
                  type="number"
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
                  placeholder="0.00"
                />
              </Field>
            )}
            {(currentUser?.rol === "admin" || currentUser?.rol === "proveedor") && (
              <Field>
                <FieldLabel htmlFor="prod-precio-costo">Precio de Costo</FieldLabel>
                <Input
                  id="prod-precio-costo"
                  type="number"
                  value={precioCosto}
                  onChange={(e) => setPrecioCosto(e.target.value)}
                  placeholder="0.00"
                />
              </Field>
            )}
            <Field className={currentUser?.rol === "admin" ? "col-span-2" : ""}>
              <FieldLabel htmlFor="prod-cantidad">Cantidad</FieldLabel>
              <Input
                id="prod-cantidad"
                type="number"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                placeholder="0"
              />
            </Field>
          </div>
          <Field>
            <FieldLabel htmlFor="prod-desc">Descripción</FieldLabel>
            <Textarea
              id="prod-desc"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Breve descripción del producto"
            />
          </Field>
          <Field orientation="horizontal" className="items-center justify-between">
            <FieldLabel htmlFor="prod-disp">Disponible</FieldLabel>
            <Switch id="prod-disp" checked={disponible} onCheckedChange={setDisponible} />
          </Field>
        </FieldGroup>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
