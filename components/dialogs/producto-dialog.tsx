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
import { currency, type Producto, type Usuario, type Categoria } from "@/types"
import { api } from "@/services"
import { API_URL } from "@/services/api.config"


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
  const [precioUber, setPrecioUber] = useState("")
  const [cantidad, setCantidad] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [disponible, setDisponible] = useState(true)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Categorias state
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loadingCats, setLoadingCats] = useState(false)
  const [isCatDialogOpen, setIsCatDialogOpen] = useState(false)
  const [newCatNombre, setNewCatNombre] = useState("")
  const [newCatTipo, setNewCatTipo] = useState<"dulce" | "salado" | "bebida">("dulce")
  const [isSavingCat, setIsSavingCat] = useState(false)

  const fetchCategorias = async () => {
    setLoadingCats(true)
    try {
      const data = await api.categorias.getAll()
      setCategorias(data)
    } catch (error) {
      console.error(error)
      toast.error("Error al cargar categorías")
    } finally {
      setLoadingCats(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchCategorias()
      setNombre(producto?.nombre ?? "")
      setCategoria(producto?.categoria ?? "Postres")
      setPrecio(producto && producto.precio !== undefined ? String(producto.precio) : "")
      setPrecioCosto(producto && producto.precioCosto !== undefined ? String(producto.precioCosto) : "")
      setPrecioUber(producto && producto.precioUber !== undefined ? String(producto.precioUber) : "")
      setCantidad(producto?.cantidad !== undefined ? String(producto.cantidad) : "0")
      setDescripcion(producto?.descripcion ?? "")
      setDisponible(producto?.disponible ?? true)
      setFile(null)
      setPreviewUrl(producto?.imagen ?? null)
    }
  }, [open, producto])

  const handleSaveCat = async () => {
    if (!newCatNombre.trim()) {
      toast.error("El nombre de la categoría es requerido")
      return
    }
    setIsSavingCat(true)
    try {
      const nueva = await api.categorias.create({ nombre: newCatNombre, tipo: newCatTipo })
      setCategorias([...categorias, nueva].sort((a, b) => a.nombre.localeCompare(b.nombre)))
      setCategoria(nueva.nombre)
      setTipo(nueva.tipo)
      toast.success("Categoría creada")
      setIsCatDialogOpen(false)
      setNewCatNombre("")
      setNewCatTipo("dulce")
    } catch (error) {
      console.error(error)
      toast.error("Error al crear la categoría")
    } finally {
      setIsSavingCat(false)
    }
  }

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
        precioUber: parseFloat(precioUber) || 0,
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
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{producto ? "Editar producto" : "Nuevo producto"}</DialogTitle>
          <DialogDescription>
            Completa la información del producto del catálogo.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto overflow-x-hidden px-2 py-1">
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
                <div className="flex gap-2">
                  <Select 
                    value={categoria} 
                    onValueChange={(v) => {
                      if (!v) return;
                      setCategoria(v)
                      const cat = categorias.find(c => c.nombre === v)
                      if (cat) setTipo(cat.tipo)
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={loadingCats ? "Cargando..." : "Seleccione..."} />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map((c) => (
                        <SelectItem key={c.id} value={c.nombre}>
                          {c.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon" 
                    className="shrink-0"
                    onClick={() => setIsCatDialogOpen(true)} 
                    title="Nueva Categoría"
                  >
                    +
                  </Button>
                </div>
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
              {(currentUser?.rol === "admin" || currentUser?.rol !== "proveedor") && (
                <Field>
                  <FieldLabel htmlFor="prod-precio-uber">Precio UberEats</FieldLabel>
                  <Input
                    id="prod-precio-uber"
                    type="number"
                    value={precioUber}
                    onChange={(e) => setPrecioUber(e.target.value)}
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
              <Field className={currentUser?.rol === "admin" ? "" : "col-span-2"}>
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
              {(previewUrl && previewUrl.trim() !== '' && previewUrl !== 'null' && previewUrl !== 'undefined') && (
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
          <Button onClick={handleSave} disabled={isSaving}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Diálogo anidado/secundario para crear categoría */}
    <Dialog open={isCatDialogOpen} onOpenChange={setIsCatDialogOpen}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Nueva categoría</DialogTitle>
          <DialogDescription>
            Agrega una nueva categoría al sistema.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <Field>
            <FieldLabel htmlFor="cat-nombre">Nombre</FieldLabel>
            <Input
              id="cat-nombre"
              value={newCatNombre}
              onChange={(e) => setNewCatNombre(e.target.value)}
              placeholder="Ej: Empanadas horneadas"
              autoFocus
            />
          </Field>
          <Field>
            <FieldLabel>Tipo por defecto</FieldLabel>
            <Select value={newCatTipo} onValueChange={(v) => v !== null && setNewCatTipo(v as any)}>
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
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsCatDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSaveCat} disabled={isSavingCat}>Guardar Categoría</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  )
}
