"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Package, PackageMinus } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { AppPagination } from "@/components/ui/app-pagination"
import { Loader } from "@/components/ui/loader"
import { api } from "@/services"
import { currency, type Producto, type Usuario } from "@/types"
import { ProductoDialog } from "@/components/dialogs/producto-dialog"
import { API_URL } from "@/services/api.config"
import Swal from "sweetalert2"

export function InventarioModule() {
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null)
  const [items, setItems] = useState<Producto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(12)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Producto | null>(null)

  const fetchMateriales = () => {
    setIsLoading(true)
    Promise.all([
      api.productos.getPaged(currentPage, pageSize, search, "materiales", "todos", "internos"),
      new Promise(resolve => setTimeout(resolve, 1000))
    ])
      .then(([res]) => {
        setItems(res.data)
        setTotalItems(res.total)
        setTotalPages(res.totalPages)
      })
      .catch((err) => {
        console.error("Error fetching materiales", err)
        toast.error("Error de conexión al cargar el inventario")
      })
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    api.auth.getMe().then(setCurrentUser).catch(console.error)
    fetchMateriales()
  }, [currentPage, search])

  const handleAddStock = async (p: Producto) => {
    const { value: amount } = await Swal.fire({
      title: `Añadir stock`,
      text: `Material: ${p.nombre}`,
      input: 'number',
      inputLabel: 'Cantidad a ingresar:',
      inputPlaceholder: 'Ej. 10',
      showCancelButton: true,
      confirmButtonText: 'Añadir',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#e11d48',
      inputValidator: (value) => {
        if (!value || parseInt(value) <= 0) {
          return 'Ingresa una cantidad válida mayor a 0'
        }
        return null;
      }
    });

    if (amount) {
      const added = parseInt(amount);
      const newCantidad = (p.cantidad ?? 0) + added;
      const newDisponible = newCantidad > 0 ? true : p.disponible;
      try {
        await api.productos.update(p.id, { cantidad: newCantidad, disponible: newDisponible });
        toast.success(`Stock de ${p.nombre} actualizado a ${newCantidad}`);
        fetchMateriales();
      } catch (err) {
        toast.error("Error al actualizar el stock");
      }
    }
  }

  const handleDiscardStock = async (p: Producto) => {
    const { value: amount } = await Swal.fire({
      title: `Descartar stock`,
      text: `Material: ${p.nombre}`,
      input: 'number',
      inputLabel: 'Cantidad a descartar (rotura, vencimiento):',
      inputPlaceholder: 'Ej. 1',
      showCancelButton: true,
      confirmButtonText: 'Descartar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
      inputValidator: (value) => {
        if (!value || parseInt(value) <= 0) {
          return 'Ingresa una cantidad válida mayor a 0'
        }
        if (p.cantidad !== undefined && parseInt(value) > p.cantidad) {
          return 'No puedes descartar más del stock actual'
        }
        return null;
      }
    });

    if (amount) {
      const discarded = parseInt(amount);
      const newCantidad = Math.max(0, (p.cantidad ?? 0) - discarded);
      const newDisponible = newCantidad > 0;
      try {
        await api.productos.update(p.id, { cantidad: newCantidad, disponible: newDisponible });
        toast.success(`Se descartaron ${discarded} unidades de ${p.nombre}. Stock: ${newCantidad}`);
        fetchMateriales();
      } catch (err) {
        toast.error("Error al descartar el stock");
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">
          Gestiona el inventario de materiales e insumos internos de la pastelería.
        </p>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar materiales..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setCurrentPage(1)
            }}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setEditing(null)
              setDialogOpen(true)
            }}
          >
            <Plus data-icon="inline-start" />
            Nuevo material
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30">
          <Package className="mb-4 size-10 text-muted-foreground/50" />
          <p className="text-muted-foreground">No hay materiales en el inventario.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {items.map((p) => (
            <Card key={p.id} className="overflow-hidden transition-all hover:shadow-md border-border/50 bg-white group">
              <div className="relative aspect-[4/3] w-full bg-muted overflow-hidden">
                <img
                  src={(p.imagen && p.imagen.trim() !== '' && p.imagen !== 'null' && p.imagen !== 'undefined') ? (p.imagen.startsWith('data:') ? p.imagen : API_URL.replace('/api', '') + p.imagen) : "/placeholder.svg"}
                  alt={p.nombre}
                  className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-medium leading-tight line-clamp-1">{p.nombre}</h3>
                <div className="mt-2 flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">
                    Costo: {currency(p.precioCosto || 0)}
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">Stock: {p.cantidad ?? 0}</span>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => {
                    setEditing(p)
                    setDialogOpen(true)
                  }}>
                    Editar
                  </Button>
                  <Button variant="secondary" size="sm" className="flex-1" onClick={() => handleAddStock(p)}>
                    Añadir stock
                  </Button>
                  <Button variant="outline" size="sm" className="flex-none px-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200" onClick={() => handleDiscardStock(p)} title="Descartar stock" disabled={(p.cantidad ?? 0) <= 0}>
                    <PackageMinus size={16} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <AppPagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={totalItems}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      <ProductoDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        producto={editing}
        onSaved={fetchMateriales}
        currentUser={currentUser}
        defaultProveedorId="internos"
        defaultTipo="material"
      />
    </div>
  )
}
