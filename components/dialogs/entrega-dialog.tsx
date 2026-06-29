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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { api } from "@/lib/api"
import type { Producto, Usuario } from "@/lib/data"
import { Plus, Minus, Trash2 } from "lucide-react"

export function EntregaDialog({
  open,
  onOpenChange,
  onSaved,
  currentUser,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  onSaved?: () => void
  currentUser?: Usuario | null
}) {
  const [fechaPrevista, setFechaPrevista] = useState("")
  const [productos, setProductos] = useState<Producto[]>([])
  const [items, setItems] = useState<{productoId: string, cantidad: number, nombre: string}[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [selectedProducto, setSelectedProducto] = useState("")
  const [proveedores, setProveedores] = useState<Usuario[]>([])
  const [selectedProveedor, setSelectedProveedor] = useState("")

  const isAdmin = currentUser?.rol === "admin"

  useEffect(() => {
    if (open) {
      setFechaPrevista(new Date().toISOString().split('T')[0])
      setItems([])
      setSelectedProducto("")
      setSelectedProveedor("")
      
      if (isAdmin) {
        api.usuarios.getAll().then(users => {
          setProveedores(users.filter((u: any) => u.rol === 'proveedor'))
        }).catch(console.error)
      } else {
        api.productos.getAll().then(setProductos).catch(console.error)
      }
    }
  }, [open, isAdmin])

  useEffect(() => {
    if (isAdmin && selectedProveedor) {
      api.productos.getAll().then(prods => {
        setProductos(prods.filter(p => p.proveedorId === selectedProveedor))
      }).catch(console.error)
    } else if (isAdmin && !selectedProveedor) {
      setProductos([])
    }
  }, [selectedProveedor, isAdmin])

  const handleAddItem = () => {
    if (!selectedProducto) return
    const prod = productos.find(p => p.id === selectedProducto)
    if (!prod) return
    
    const max = prod.cantidad || 0;
    if (max <= 0) {
      toast.error("El proveedor no tiene stock de este producto")
      return
    }

    const existing = items.find(i => i.productoId === selectedProducto)
    if (existing && existing.cantidad >= max) {
      toast.error(`El proveedor solo tiene ${max} en stock`)
      return
    }

    setItems(prev => {
      const existing = prev.find(i => i.productoId === selectedProducto)
      if (existing) {
        return prev.map(i => i.productoId === selectedProducto ? { ...i, cantidad: Math.min(i.cantidad + 1, max) } : i)
      }
      return [...prev, { productoId: selectedProducto, cantidad: 1, nombre: prod.nombre }]
    })
    setSelectedProducto("")
  }

  const updateQty = (id: string, delta: number) => {
    const prod = productos.find(p => p.id === id)
    const max = prod?.cantidad || 0

    const currentItem = items.find(i => i.productoId === id)
    if (!currentItem) return

    if (delta > 0 && currentItem.cantidad >= max) {
      toast.error(`El proveedor solo tiene ${max} en stock`)
      return
    }

    setItems((prev) =>
      prev
        .map((i) =>
          i.productoId === id ? { ...i, cantidad: Math.max(1, Math.min(i.cantidad + delta, max)) } : i,
        )
    )
  }

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.productoId !== id))
  }

  const handleSave = async () => {
    if (!fechaPrevista) {
      toast.error("La fecha es requerida")
      return
    }
    if (isAdmin && !selectedProveedor) {
      toast.error("Selecciona un proveedor")
      return
    }
    if (items.length === 0) {
      toast.error("Agrega al menos un producto")
      return
    }

    setIsSaving(true)
    try {
      await api.entregas.create({
        proveedorId: isAdmin ? selectedProveedor : undefined,
        fechaPrevista: new Date(fechaPrevista).toISOString(),
        items: items.map(i => ({ productoId: i.productoId, cantidad: i.cantidad }))
      } as any)
      
      toast.success("Entrega programada con éxito")
      if (onSaved) onSaved()
      onOpenChange(false)
    } catch (error) {
      console.error(error)
      toast.error("Error al programar la entrega")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Programar Nueva Entrega</DialogTitle>
          <DialogDescription>
            Selecciona los productos y la fecha en que los entregarás.
          </DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="entrega-fecha">Fecha Prevista de Entrega</FieldLabel>
            <Input
              id="entrega-fecha"
              type="date"
              value={fechaPrevista}
              onChange={(e) => setFechaPrevista(e.target.value)}
            />
          </Field>
          
          {isAdmin && (
            <Field>
              <FieldLabel>Proveedor</FieldLabel>
              <select 
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedProveedor}
                onChange={e => {
                  setSelectedProveedor(e.target.value)
                  setItems([])
                  setSelectedProducto("")
                }}
              >
                <option value="">-- Seleccione proveedor --</option>
                {proveedores.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
            </Field>
          )}

          <div className="flex flex-col gap-2 mt-4 border-t pt-4">
            <FieldLabel>Añadir Productos</FieldLabel>
            <div className="flex gap-2">
              <select 
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedProducto}
                onChange={e => setSelectedProducto(e.target.value)}
              >
                <option value="">-- Seleccione producto --</option>
                {productos.map(p => (
                  <option key={p.id} value={p.id} disabled={(p.cantidad || 0) <= 0}>
                    {p.nombre} (Stock: {p.cantidad || 0})
                  </option>
                ))}
              </select>
              <Button type="button" onClick={handleAddItem} variant="secondary">Añadir</Button>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            {items.map(item => (
              <div key={item.productoId} className="flex items-center gap-2 rounded-lg border border-border p-2">
                <span className="flex-1 text-sm font-medium">{item.nombre}</span>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" className="size-6" onClick={() => updateQty(item.productoId, -1)}>
                    <Minus className="size-3" />
                  </Button>
                  <span className="w-6 text-center text-sm font-medium">{item.cantidad}</span>
                  <Button variant="outline" size="icon" className="size-6" onClick={() => updateQty(item.productoId, 1)}>
                    <Plus className="size-3" />
                  </Button>
                </div>
                <Button variant="ghost" size="icon" className="size-6 text-primary ml-2" onClick={() => removeItem(item.productoId)}>
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            ))}
          </div>

        </FieldGroup>
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving || items.length === 0}>
            {isSaving ? "Guardando..." : "Programar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
