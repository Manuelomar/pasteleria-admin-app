"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { api } from "@/services"
import { type Producto } from "@/types"
import { API_URL } from "@/services/api.config"
import { Loader } from "@/components/ui/loader"

export function SelectExistingProductDialog({
  open,
  onOpenChange,
  onSelect,
  providerCategory
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  onSelect: (producto: Partial<Producto>) => void
  providerCategory?: 'productos' | 'materiales'
}) {
  const [items, setItems] = useState<Partial<Producto>[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (open) {
      setLoading(true)
      api.productos.getUniqueNames()
        .then(setItems)
        .catch((err) => {
          console.error(err)
          toast.error("Error al cargar productos existentes")
        })
        .finally(() => setLoading(false))
    }
  }, [open])

  const filtered = items.filter(i => {
    if (!i.nombre || !i.nombre.toLowerCase().includes(search.toLowerCase())) return false;
    
    if (providerCategory === 'materiales') {
      return i.tipo === 'material';
    } else {
      return i.tipo !== 'material';
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Añadir Producto Existente</DialogTitle>
          <DialogDescription>
            Busca y selecciona un producto que ya exista en el sistema para agregarlo a tu catálogo.
          </DialogDescription>
        </DialogHeader>
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No se encontraron productos.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filtered.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    onSelect(p)
                    onOpenChange(false)
                  }}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:border-primary transition-colors text-left"
                >
                  <div className="size-12 shrink-0 bg-muted rounded-md overflow-hidden">
                    <img
                      src={(p.imagen && p.imagen.trim() !== '' && p.imagen !== 'null' && p.imagen !== 'undefined') ? (p.imagen.startsWith('data:') ? p.imagen : API_URL.replace('/api', '') + p.imagen) : "/placeholder.svg"}
                      alt={p.nombre}
                      className="size-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg";
                      }}
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium line-clamp-1">{p.nombre}</span>
                    <span className="text-xs text-muted-foreground">{p.categoria || p.tipo}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
