"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Eye, Pencil, ShoppingCart, PackagePlus } from "lucide-react"
import { AppPagination } from "@/components/ui/app-pagination"
import { toast } from "sonner"
import Swal from "sweetalert2"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { TipoBadge, DisponibleBadge } from "@/components/badges"
import { ProductoDialog } from "@/components/dialogs/producto-dialog"
import { DetalleProductoDialog } from "@/components/dialogs/detalle-producto-dialog"
import { currency, type Producto, type Tipo, type Usuario } from "@/types"
import { api } from "@/services"
import { API_URL } from "@/services/api.config"
import { cn } from "@/lib/utils"
import { Loader } from "@/components/ui/loader"
import { Folder, ArrowLeft } from "lucide-react"

export function CatalogoModule() {
  const [items, setItems] = useState<Producto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(8)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const [search, setSearch] = useState("")
  const [tipo, setTipo] = useState<"todos" | Tipo>("todos")
  const [disp, setDisp] = useState<"todos" | "disponible" | "no-disponible">("todos")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Producto | null>(null)
  const [viewing, setViewing] = useState<Producto | null>(null)
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null)
  
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null)
  const [providers, setProviders] = useState<Usuario[]>([])

  const isAdmin = currentUser?.rol === "admin"

  useEffect(() => {
    api.auth.getMe().then(user => {
      setCurrentUser(user)
      if (user.rol === "admin") {
        api.usuarios.getAll().then(users => {
          setProviders(users.filter(u => u.rol === "proveedor"))
        }).catch(console.error)
      } else if (user.rol === "proveedor") {
        setSelectedProviderId(user.id)
      }
    }).catch(console.error)
  }, [])

  const fetchProductos = () => {
    if (isAdmin && !selectedProviderId) return; // Don't fetch if viewing providers list

    setIsLoading(true)
    Promise.all([
      api.productos.getPaged(currentPage, pageSize, search, tipo, disp, selectedProviderId === "internos" ? "internos" : selectedProviderId || undefined),
      new Promise(resolve => setTimeout(resolve, 1000))
    ])
      .then(([res]) => {
        setItems(res.data)
        setTotalItems(res.total)
        setTotalPages(res.totalPages)
      })
      .catch((err) => {
        console.error("Error fetching productos", err)
        toast.error("Error de conexión al cargar productos")
      })
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    fetchProductos()
  }, [currentPage, search, tipo, disp, selectedProviderId, isAdmin])

  const handleSearchChange = (val: string) => {
    setSearch(val)
    setCurrentPage(1)
  }

  const handleTipoChange = (val: "todos" | Tipo) => {
    setTipo(val)
    setCurrentPage(1)
  }

  const handleDispChange = (val: "todos" | "disponible" | "no-disponible") => {
    setDisp(val)
    setCurrentPage(1)
  }

  const filtered = items;

  const handleAddStock = async (p: Producto) => {
    const { value: amount } = await Swal.fire({
      title: `Añadir stock`,
      text: `Producto: ${p.nombre}`,
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
        fetchProductos();
      } catch (err) {
        toast.error("Error al actualizar el stock");
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
          Gestiona los productos de la pastelería: dulces, salados y bebidas.
        </p>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar producto..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          onClick={() => {
            setEditing(null)
            setDialogOpen(true)
          }}
        >
          <Plus data-icon="inline-start" />
          Nuevo producto
        </Button>
      </div>

      {isAdmin && !selectedProviderId ? (
        <div className="mt-4 flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Seleccione una categoría para gestionar productos:</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setSelectedProviderId("internos")}>
              <CardContent className="flex flex-col items-center justify-center p-6 gap-3">
                <div className="p-4 rounded-full bg-primary/10 text-primary">
                  <PackagePlus className="size-8" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-center">Productos Internos</h3>
                <p className="text-sm text-muted-foreground text-center">Pastelería Bizcochao</p>
              </CardContent>
            </Card>

            {providers.map(prov => (
              <Card key={prov.id} className="cursor-pointer hover:border-primary transition-colors" onClick={() => setSelectedProviderId(prov.id)}>
                <CardContent className="flex flex-col items-center justify-center p-6 gap-3">
                  <div className="p-4 rounded-full bg-primary/10 text-primary">
                    <Folder className="size-8" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-center">{prov.nombre}</h3>
                  <p className="text-sm text-muted-foreground text-center">Proveedor</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <>
          {isAdmin && (
            <div className="mb-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedProviderId(null)}>
                <ArrowLeft className="mr-2 size-4" />
                Volver a Proveedores
              </Button>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-4">
            <ToggleGroup
          value={[tipo]}
          onValueChange={(v) => v.length > 0 && handleTipoChange(v[0] as typeof tipo)}
          variant="outline"
        >
          <ToggleGroupItem value="todos">Todos</ToggleGroupItem>
          <ToggleGroupItem value="dulce">Dulce</ToggleGroupItem>
          <ToggleGroupItem value="salado">Salado</ToggleGroupItem>
          <ToggleGroupItem value="bebida">Bebida</ToggleGroupItem>
        </ToggleGroup>

        <ToggleGroup
          value={[disp]}
          onValueChange={(v) => v.length > 0 && handleDispChange(v[0] as typeof disp)}
          variant="outline"
        >
          <ToggleGroupItem value="todos">Disponibilidad</ToggleGroupItem>
          <ToggleGroupItem value="disponible">Disponible</ToggleGroupItem>
          <ToggleGroupItem value="no-disponible">No disponible</ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((p) => (
          <Card key={p.id} className="overflow-hidden pt-0">
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
              <img
                src={p.imagen ? (API_URL.replace('/api', '') + p.imagen) : ["https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop","https://images.unsplash.com/photo-1557925923-cd4648e211a0?w=400&h=300&fit=crop","https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&h=300&fit=crop","https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400&h=300&fit=crop"][p.id.charCodeAt(0) % 4]}
                alt={p.nombre}
                className={cn(
                  "size-full object-cover transition",
                  !p.disponible && "opacity-60 grayscale",
                )}
              />
              <div className="absolute left-2 top-2">
                <TipoBadge tipo={p.tipo} />
              </div>
            </div>
            <CardContent className="flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col">
                  <h3 className="font-medium leading-tight text-foreground">{p.nombre}</h3>
                  <span className="text-xs text-muted-foreground">{p.categoria}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-heading text-lg font-semibold text-primary">
                    {currency(p.precio)}
                  </span>
                  {(currentUser?.rol === "admin" || currentUser?.rol === "proveedor") && (
                    <span className="text-xs font-medium text-muted-foreground">
                      Costo: {currency(p.precioCosto || 0)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between mt-1">
                <DisponibleBadge disponible={p.disponible} />
                <span className="text-xs font-medium text-muted-foreground">Stock: {p.cantidad ?? 0}</span>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setViewing(p)}
              >
                <Eye data-icon="inline-start" />
                Ver
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditing(p)
                  setDialogOpen(true)
                }}
              >
                <Pencil />
                <span className="sr-only">Editar</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                onClick={() => handleAddStock(p)}
                title="Añadir stock"
              >
                <PackagePlus />
                <span className="sr-only">Añadir stock</span>
              </Button>
              {/* <Button
                size="sm"
                onClick={() => toast.success(`${p.nombre} agregado a la venta`)}
              >
                <ShoppingCart />
                <span className="sr-only">Agregar a venta</span>
              </Button> */}
            </CardFooter>
          </Card>
        ))}
      </div>

      {items.length === 0 && !isLoading ? (
        <div className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No se encontraron productos con los filtros aplicados.
        </div>
      ) : null}

      <AppPagination
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={totalItems}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemName="productos"
      />
      </>
      )}

      <ProductoDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        producto={editing} 
        onSaved={fetchProductos}
        currentUser={currentUser}
        defaultProveedorId={selectedProviderId === "internos" ? undefined : selectedProviderId}
      />

      <DetalleProductoDialog
        open={!!viewing}
        onOpenChange={(open) => !open && setViewing(null)}
        producto={viewing}
      />
    </div>
  )
}
