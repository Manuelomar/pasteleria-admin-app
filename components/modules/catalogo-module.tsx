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
import { SelectExistingProductDialog } from "@/components/dialogs/select-existing-product-dialog"
import { currency, type Producto, type Tipo, type Usuario } from "@/types"
import { api } from "@/services"
import { API_URL } from "@/services/api.config"
import { cn } from "@/lib/utils"
import { Loader } from "@/components/ui/loader"
import { Folder, ArrowLeft } from "lucide-react"

export function CatalogoModule({ subModule }: { subModule?: string }) {
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
  const [existingDialogOpen, setExistingDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Producto | null>(null)
  const [viewing, setViewing] = useState<Producto | null>(null)
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null)
  
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null)
  const [providerCategory, setProviderCategory] = useState<"productos" | "materiales" | null>(null)
  const [enablingMaterials, setEnablingMaterials] = useState(false)
  const [providers, setProviders] = useState<Usuario[]>([])

  const isAdmin = currentUser?.rol === "admin"

  useEffect(() => {
    api.auth.getMe().then(user => {
      setCurrentUser(user)
      if (user.rol === "admin") {
        api.usuarios.getAll().then(users => {
          const provs = users.filter(u => u.rol === "proveedor")
          setProviders(provs)
          
          if (subModule) {
            const decodedName = decodeURIComponent(subModule)
            if (decodedName === "internos") {
              setSelectedProviderId("internos")
            } else {
              const matched = provs.find(p => p.nombre === decodedName)
              if (matched) {
                setSelectedProviderId(matched.id)
              }
            }
          }
        }).catch(console.error)
      } else if (user.rol === "proveedor") {
        setSelectedProviderId(user.id)
      }
    }).catch(console.error)
  }, [subModule])

  const fetchProductos = () => {
    if (isAdmin && !selectedProviderId) return; // Don't fetch if viewing providers list

    const selectedProvider = providers.find(p => p.id === selectedProviderId) || (currentUser?.rol === 'proveedor' ? currentUser : null);
    if (selectedProviderId && selectedProviderId !== "internos" && selectedProvider?.vendeMateriales && !providerCategory) {
      setItems([]);
      return; 
    }

    setIsLoading(true)
    let effectiveTipo: any = tipo;
    if (selectedProviderId && selectedProviderId !== "internos") {
       if (selectedProvider?.vendeMateriales) {
         if (providerCategory === 'materiales') effectiveTipo = 'materiales';
         else if (providerCategory === 'productos' && tipo === 'todos') effectiveTipo = 'productos';
       } else {
         if (tipo === 'todos') effectiveTipo = 'productos';
       }
    } else if (selectedProviderId === "internos" && tipo === 'todos') {
       effectiveTipo = 'productos';
    }

    Promise.all([
      api.productos.getPaged(currentPage, pageSize, search, effectiveTipo, disp, selectedProviderId === "internos" ? "internos" : selectedProviderId || undefined),
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
  }, [currentPage, search, tipo, disp, selectedProviderId, isAdmin, providerCategory, currentUser])

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

  const handleAddExisting = async (p: Partial<Producto>) => {
    try {
      const data: any = {
        ...p,
        cantidad: 0,
        proveedorId: selectedProviderId === "internos" ? undefined : selectedProviderId || undefined,
      }
      
      // If the catalog is strictly for materials, make sure it is set as material
      if (providerCategory === 'materiales') {
        data.tipo = 'material';
        data.categoria = 'Materiales';
      }

      await api.productos.create(data);
      toast.success("Producto añadido al catálogo");
      fetchProductos();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Error al añadir el producto");
    }
  }

  const handleAddStock = async (p: Producto) => {
    // ... [Content unchanged but to keep file correct I need to match the previous handleAddStock completely or just add after it]
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

  const handleEnableMaterials = async () => {
    const pId = currentUser?.rol === 'proveedor' ? currentUser.id : selectedProviderId;
    if (!pId || pId === "internos") return;
    setEnablingMaterials(true);
    try {
      await api.usuarios.enableMaterials(pId);
      toast.success("Venta de materiales habilitada");
      if (isAdmin) {
        setProviders(providers.map(p => p.id === pId ? { ...p, vendeMateriales: true } : p));
      } else if (currentUser) {
        setCurrentUser({ ...currentUser, vendeMateriales: true });
      }
      setProviderCategory('productos');
    } catch (e: any) {
      toast.error(e.message || "Error al habilitar materiales");
    } finally {
      setEnablingMaterials(false);
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

      {(!isAdmin || selectedProviderId) && (selectedProviderId === "internos" || providerCategory || !(providers.find(p => p.id === selectedProviderId) || (currentUser?.rol === 'proveedor' ? currentUser : null))?.vendeMateriales) && (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            {(!isAdmin || selectedProviderId) && selectedProviderId !== "internos" && !(providers.find(p => p.id === selectedProviderId) || (currentUser?.rol === 'proveedor' ? currentUser : null))?.vendeMateriales && (
               <Button variant="outline" onClick={handleEnableMaterials} disabled={enablingMaterials}>
                 Habilitar Venta de Materiales
               </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setExistingDialogOpen(true)}
            >
              Añadir existente
            </Button>
            <Button
              onClick={() => {
                setEditing(null)
                setDialogOpen(true)
              }}
            >
              <Plus data-icon="inline-start" />
              {providerCategory === 'materiales' ? 'Nuevo material' : 'Nuevo producto'}
            </Button>
          </div>
        </div>
      )}

      {isAdmin && !selectedProviderId ? (
        <div className="mt-4 flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Seleccione una categoría para gestionar productos:</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => {
              setSelectedProviderId("internos")
              window.history.pushState(null, '', '/catalogo/internos')
            }}>
              <CardContent className="flex flex-col items-center justify-center p-6 gap-3">
                <div className="p-4 rounded-full bg-primary/10 text-primary">
                  <PackagePlus className="size-8" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-center">Productos Internos</h3>
                <p className="text-sm text-muted-foreground text-center">Pastelería Bizcochao</p>
              </CardContent>
            </Card>

            {providers.map(prov => (
              <Card key={prov.id} className="cursor-pointer hover:border-primary transition-colors" onClick={() => {
                setSelectedProviderId(prov.id)
                window.history.pushState(null, '', `/catalogo/${encodeURIComponent(prov.nombre)}`)
              }}>
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
              <Button variant="outline" size="sm" onClick={() => {
                if (providerCategory) {
                   setProviderCategory(null);
                } else {
                   setSelectedProviderId(null);
                   window.history.pushState(null, '', '/catalogo');
                }
              }}>
                <ArrowLeft className="mr-2 size-4" />
                {providerCategory ? "Volver a Opciones" : "Volver a Proveedores"}
              </Button>
            </div>
          )}

          {(!isAdmin && providerCategory) && (
            <div className="mb-2">
              <Button variant="outline" size="sm" onClick={() => {
                setProviderCategory(null);
              }}>
                <ArrowLeft className="mr-2 size-4" />
                Volver a Opciones
              </Button>
            </div>
          )}
          
          {selectedProviderId !== "internos" && (() => {
             const selectedProvider = providers.find(p => p.id === selectedProviderId) || (currentUser?.rol === 'proveedor' ? currentUser : null);
             if (selectedProvider?.vendeMateriales && !providerCategory) {
               return (
                  <div className="mt-4 flex flex-col gap-4">
                    <h2 className="text-lg font-semibold">Seleccione una categoría:</h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setProviderCategory('productos')}>
                        <CardContent className="flex flex-col items-center justify-center p-6 gap-3">
                          <div className="p-4 rounded-full bg-primary/10 text-primary">
                            <PackagePlus className="size-8" />
                          </div>
                          <h3 className="font-heading text-lg font-semibold text-center">Productos</h3>
                        </CardContent>
                      </Card>
                      <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setProviderCategory('materiales')}>
                        <CardContent className="flex flex-col items-center justify-center p-6 gap-3">
                          <div className="p-4 rounded-full bg-amber-500/10 text-amber-500">
                            <Folder className="size-8" />
                          </div>
                          <h3 className="font-heading text-lg font-semibold text-center">Materiales</h3>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
               )
             }
             return null;
          })()}

          {(selectedProviderId === "internos" || providerCategory || !(providers.find(p => p.id === selectedProviderId) || (currentUser?.rol === 'proveedor' ? currentUser : null))?.vendeMateriales) && (
          <>
          <div className="flex flex-wrap items-center gap-4">
            {providerCategory !== 'materiales' && (
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
            )}

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
                src={(p.imagen && p.imagen.trim() !== '' && p.imagen !== 'null' && p.imagen !== 'undefined') ? (p.imagen.startsWith('data:') ? p.imagen : API_URL.replace('/api', '') + p.imagen) : ["https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop","https://images.unsplash.com/photo-1557925923-cd4648e211a0?w=400&h=300&fit=crop","https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&h=300&fit=crop","https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400&h=300&fit=crop"][p.id.charCodeAt(0) % 4]}
                alt={p.nombre}
                onError={(e) => {
                  e.currentTarget.src = ["https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop","https://images.unsplash.com/photo-1557925923-cd4648e211a0?w=400&h=300&fit=crop","https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&h=300&fit=crop","https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400&h=300&fit=crop"][p.id.charCodeAt(0) % 4];
                }}
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
                  {currentUser?.rol !== "proveedor" && (
                    <span className="font-heading text-lg font-semibold text-primary">
                      {currency(p.precio)}
                    </span>
                  )}
                  {(currentUser?.rol === "admin" || currentUser?.rol === "proveedor") && (
                    <span className={cn(
                      currentUser?.rol === "proveedor" 
                        ? "font-heading text-lg font-semibold text-primary" 
                        : "text-xs font-medium text-muted-foreground"
                    )}>
                      {currentUser?.rol === "proveedor" 
                        ? currency(p.precioCosto || 0) 
                        : `Costo: ${currency(p.precioCosto || 0)}`}
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
        </>
      )}

      <ProductoDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        producto={editing} 
        onSaved={fetchProductos}
        currentUser={currentUser}
        defaultProveedorId={selectedProviderId === "internos" ? undefined : selectedProviderId || undefined}
        defaultTipo={providerCategory === 'materiales' ? 'material' : undefined}
      />

      <SelectExistingProductDialog
        open={existingDialogOpen}
        onOpenChange={setExistingDialogOpen}
        onSelect={handleAddExisting}
      />

      <DetalleProductoDialog
        open={!!viewing}
        onOpenChange={(open) => !open && setViewing(null)}
        producto={viewing}
        currentUser={currentUser}
      />
    </div>
  )
}
