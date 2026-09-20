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
import { api } from "@/services"
import type { Producto, Usuario } from "@/types"
import { Plus, Minus, Trash2 } from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

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
  const [tipoItem, setTipoItem] = useState<"productos" | "materiales" | "">("")
  const [isProductSelectorOpen, setIsProductSelectorOpen] = useState(false)
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set())

  const isAdmin = currentUser?.rol === "admin"
  const selectedProviderObj = isAdmin ? proveedores.find(p => p.id === selectedProveedor) : currentUser;
  const vendeMateriales = selectedProviderObj?.vendeMateriales;

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
      } else if (currentUser) {
        api.productos.getAll().then(prods => {
          setProductos(prods.filter(p => p.proveedorId === currentUser.id))
        }).catch(console.error)
      }
    }
  }, [open, isAdmin, currentUser])

  useEffect(() => {
    if (isAdmin && selectedProveedor) {
      api.productos.getAll().then(prods => {
        setProductos(prods.filter(p => p.proveedorId === selectedProveedor))
      }).catch(console.error)
    } else if (isAdmin && !selectedProveedor) {
      setProductos([])
    }
  }, [selectedProveedor, isAdmin])

  const filteredProductos = productos.filter(p => (vendeMateriales && tipoItem === "materiales") ? p.tipo === "material" : p.tipo !== "material")

  const handleSelectAll = () => {
    const allAvailableIds = filteredProductos
      .filter(p => (p.cantidad || 0) > 0)
      .map(p => p.id);
    
    if (selectedProductIds.size === allAvailableIds.length && allAvailableIds.length > 0) {
      setSelectedProductIds(new Set());
    } else {
      setSelectedProductIds(new Set(allAvailableIds));
    }
  }

  const handleConfirmSelection = () => {
    setItems(prev => {
      const newItems = [...prev];
      selectedProductIds.forEach(id => {
        const prod = productos.find(p => p.id === id);
        if (!prod) return;
        const max = prod.cantidad || 0;
        if (max <= 0) return;
        
        const existing = newItems.find(i => i.productoId === id);
        if (!existing) {
          newItems.push({ productoId: id, cantidad: 1, nombre: prod.nombre });
        }
      });
      return newItems;
    });
    setIsProductSelectorOpen(false);
    setSelectedProductIds(new Set());
  }

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
    <>
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
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedProveedor}
                onChange={e => {
                  setSelectedProveedor(e.target.value)
                  setItems([])
                  setSelectedProducto("")
                  setTipoItem("")
                }}
              >
                <option value="" className="bg-background text-foreground">-- Seleccione proveedor --</option>
                {proveedores.map(p => (
                  <option key={p.id} value={p.id} className="bg-background text-foreground">{p.nombre}</option>
                ))}
              </select>
            </Field>
          )}

          {(!isAdmin || selectedProveedor) && (
            <div className="flex flex-col gap-2 mt-4 border-t pt-4">
              {vendeMateriales && (
                <div className="flex items-center justify-between">
                  <FieldLabel>¿Qué deseas añadir?</FieldLabel>
                  <ToggleGroup 
                    value={tipoItem ? [tipoItem] : []} 
                    onValueChange={(v) => {
                      if (v && v.length > 0) {
                        setTipoItem(v[0] as any)
                        setSelectedProducto("")
                      }
                    }} 
                    size="sm"
                    variant="outline"
                  >
                    <ToggleGroupItem value="productos">Productos</ToggleGroupItem>
                    <ToggleGroupItem value="materiales">Materiales</ToggleGroupItem>
                  </ToggleGroup>
                </div>
              )}
              
              {(!vendeMateriales || tipoItem !== "") && (
                <div className="flex flex-col gap-2 mt-2">
                  <FieldLabel>Añadir {tipoItem === "materiales" ? "Materiales" : "Productos"}</FieldLabel>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      // Resetear la selección al abrir el modal con lo que ya está en la lista (opcional, pero mejor que empiece vacío para "añadir más")
                      setSelectedProductIds(new Set())
                      setIsProductSelectorOpen(true)
                    }} 
                    className="w-full justify-start text-muted-foreground bg-muted/50 hover:bg-muted"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Seleccionar {tipoItem === "materiales" ? "Materiales" : "Productos"}...
                  </Button>
                </div>
              )}
            </div>
          )}

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

    {/* Selector Modal */}
      <Dialog open={isProductSelectorOpen} onOpenChange={setIsProductSelectorOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[85vh] flex flex-col p-0 overflow-hidden bg-background/95 backdrop-blur-md">
          <div className="p-6 pb-4 border-b">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold tracking-tight">Seleccionar {tipoItem === "materiales" ? "Materiales" : "Productos"}</DialogTitle>
              <DialogDescription>
                Selecciona los elementos que deseas añadir a la entrega y luego ajusta las cantidades.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-between items-center mt-6">
              <Button variant="secondary" size="sm" onClick={handleSelectAll} className="rounded-full px-4">
                {selectedProductIds.size === filteredProductos.filter(p => (p.cantidad || 0) > 0).length && filteredProductos.filter(p => (p.cantidad || 0) > 0).length > 0 
                  ? "Deseleccionar Todos" 
                  : "Seleccionar Todos"}
              </Button>
              <span className="text-sm font-medium text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                {selectedProductIds.size} seleccionados
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0 p-6 bg-muted/20">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredProductos.map(p => {
                const isSelected = selectedProductIds.has(p.id);
                const disabled = (p.cantidad || 0) <= 0;
                // Si el producto ya está en items, podemos indicarlo (opcional, por ahora lo dejamos seleccionable o mostramos un check)
                const alreadyInItems = items.some(i => i.productoId === p.id);
                
                return (
                  <div 
                    key={p.id} 
                    className={`group relative flex flex-col rounded-2xl border-2 transition-all duration-300 cursor-pointer overflow-hidden bg-card ${isSelected ? 'border-primary shadow-md scale-[0.98]' : 'border-transparent shadow-sm hover:shadow-md hover:border-primary/30'} ${disabled ? 'opacity-40 cursor-not-allowed grayscale-[0.5]' : ''}`}
                    onClick={() => {
                      if (disabled) return;
                      const newSet = new Set(selectedProductIds);
                      if (newSet.has(p.id)) newSet.delete(p.id);
                      else newSet.add(p.id);
                      setSelectedProductIds(newSet);
                    }}
                  >
                    <div className="aspect-square bg-muted/50 relative w-full overflow-hidden">
                      {p.imagen ? (
                        <img src={p.imagen} alt={p.nombre} className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/50 font-medium text-xs">Sin foto</div>
                      )}
                      
                      <div className={`absolute inset-0 bg-primary/10 transition-opacity duration-300 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                      
                      <div className={`absolute top-3 right-3 transition-all duration-300 ${isSelected ? 'scale-100 opacity-100' : 'scale-75 opacity-0 group-hover:opacity-50'}`}>
                        <div className={`rounded-full p-1.5 shadow-sm backdrop-blur-md ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-background/80 text-foreground'}`}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                      </div>

                      {alreadyInItems && !isSelected && (
                        <div className="absolute top-3 left-3 bg-secondary/90 backdrop-blur-md text-secondary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Añadido
                        </div>
                      )}
                    </div>
                    <div className="p-3.5 flex flex-col flex-1">
                      <span className="font-semibold text-sm line-clamp-2 leading-snug flex-1 group-hover:text-primary transition-colors">{p.nombre}</span>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs font-medium text-muted-foreground">Disponible:</span>
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${disabled ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>{p.cantidad || 0}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
              {filteredProductos.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <div className="bg-muted p-4 rounded-full mb-4">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-1">No hay elementos</h3>
                  <p className="text-sm max-w-sm text-center">No se encontraron {tipoItem === "materiales" ? "materiales" : "productos"} disponibles para este proveedor.</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="p-6 border-t bg-background/95 backdrop-blur-md flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsProductSelectorOpen(false)} className="rounded-full px-6">Cancelar</Button>
            <Button 
              onClick={handleConfirmSelection} 
              disabled={selectedProductIds.size === 0}
              className="rounded-full px-8 shadow-md"
            >
              Añadir {selectedProductIds.size > 0 ? selectedProductIds.size : ""} Selección
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
