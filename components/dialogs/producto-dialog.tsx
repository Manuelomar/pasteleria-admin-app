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
import { currency, type Producto, type Usuario } from "@/types"
import { api } from "@/services"
import { API_URL } from "@/services/api.config"

const categorias = [
  "Postres",
  "Salados",
  "Bebidas",
  "Bizcochos",
  "Combos",
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
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setNombre(producto?.nombre ?? "")
      setCategoria(producto?.categoria ?? "Postres")
      setPrecio(producto && producto.precio !== undefined ? String(producto.precio) : "")
      setPrecioCosto(producto && producto.precioCosto !== undefined ? String(producto.precioCosto) : "")
      setCantidad(producto?.cantidad !== undefined ? String(producto.cantidad) : "0")
      setDescripcion(producto?.descripcion ?? "")
      setDisponible(producto?.disponible ?? true)
      setFile(null)
      setPreviewUrl(producto?.imagen ?? null)
    }
  }, [open, producto])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      let imagenUrl = producto?.imagen;
      if (file) {
        const uploadRes = await api.productos.uploadImage(file);
        imagenUrl = uploadRes.url;
      }

      let derivedTipo = "dulce";
      if (categoria === "Salados") derivedTipo = "salado";
      if (categoria === "Bebidas") derivedTipo = "bebida";

      const data: any = {
        nombre,
        categoria,
        tipo: derivedTipo,
        precio: parseFloat(precio) || 0,
        precioCosto: parseFloat(precioCosto) || 0,
        cantidad: parseInt(cantidad) || 0,
        descripcion,
        disponible,
        imagen: imagenUrl,
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
        <div className="max-h-[60vh] overflow-y-auto px-2 py-1">
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
            <div className="grid gap-4">
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
                  {producto?.historialCostos && producto.historialCostos.length > 0 && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Costos anteriores: {producto.historialCostos.map(c => currency(c)).join(', ')}
                    </div>
                  )}
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
            <Field>
              <FieldLabel htmlFor="prod-imagen">Imagen (Opcional)</FieldLabel>
              <Input
                id="prod-imagen"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setFile(f);
                    setPreviewUrl(URL.createObjectURL(f));
                  }
                }}
              />
              {previewUrl && (
                <div className="mt-2">
                  <img 
                    src={previewUrl.startsWith('blob:') ? previewUrl : API_URL.replace('/api', '') + previewUrl} 
                    alt="Vista previa" 
                    className="h-20 w-auto rounded object-cover border border-border" 
                  />
                </div>
              )}
            </Field>
            <Field orientation="horizontal" className="items-center justify-between">
              <FieldLabel htmlFor="prod-disp">Disponible</FieldLabel>
              <Switch id="prod-disp" checked={disponible} onCheckedChange={setDisponible} />
            </Field>
          </FieldGroup>
        </div>
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
