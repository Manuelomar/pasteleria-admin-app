"use client"

import { useState, useEffect } from "react"
import { Search, Cake, Package } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { Card, CardContent } from "@/components/ui/card"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { TipoBadge } from "@/components/badges"
import { currency, type Producto, type Tipo } from "@/types"
import { api } from "@/services"
import { AppPagination } from "@/components/ui/app-pagination"
import { Loader } from "@/components/ui/loader"
import { API_URL } from "@/services/api.config"

export function MenuPublicoModule() {
  const [search, setSearch] = useState("")
  const [tipo, setTipo] = useState<"productos" | Tipo>("productos")
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [fetchedProductos, setFetchedProductos] = useState<Producto[]>([])
  const [isNavigating, setIsNavigating] = useState(false)
  const router = useRouter()

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(12)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const loadProductos = () => {
    setIsLoadingData(true)
    Promise.all([
      api.productos.getPublicPaged(currentPage, pageSize, search, tipo as any),
      new Promise(resolve => setTimeout(resolve, 800)) // pequeña demora para mostrar loader suave
    ])
      .then(([res]) => {
        setFetchedProductos(res.data)
        setTotalItems(res.total)
        setTotalPages(res.totalPages)
      })
      .catch((err) => {
        console.error(err)
        toast.error("Error cargando el menú")
      })
      .finally(() => setIsLoadingData(false))
  }

  useEffect(() => {
    loadProductos()
  }, [currentPage, search, tipo])

  const handleSearchChange = (val: string) => {
    setSearch(val)
    setCurrentPage(1)
  }

  const handleTipoChange = (val: "productos" | Tipo) => {
    setTipo(val)
    setCurrentPage(1)
  }

  const handleNavigate = (path: string) => {
    setIsNavigating(true)
    router.push(path)
  }

  return (
    <>
      {isNavigating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm">
          <Loader />
        </div>
      )}
      <div className="flex min-h-screen flex-col bg-background">
      {/* Header Público */}
      <header className="sticky top-0 z-10 flex flex-col items-center justify-center border-b bg-background/95 p-4 shadow-sm relative backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <h1 className="font-heading text-3xl font-bold text-primary">Bizcochao</h1>
        <p className="text-sm text-muted-foreground">Catálogo de Productos</p>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => handleNavigate('/personaliza-combo')}
            className="gap-2 hidden sm:flex text-primary border-primary/20 hover:bg-primary/5"
          >
            <Package className="h-4 w-4" />
            <span>Personaliza tu Combo</span>
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => handleNavigate('/personaliza-combo')}
            className="sm:hidden text-primary border-primary/20 hover:bg-primary/5"
          >
            <Package className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => handleNavigate('/personaliza-bizcocho')}
            className="gap-2 hidden sm:flex text-primary border-primary/20 hover:bg-primary/5"
          >
            <Cake className="h-4 w-4" />
            <span>Personaliza tu Bizcocho</span>
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => handleNavigate('/personaliza-bizcocho')}
            className="sm:hidden text-primary border-primary/20 hover:bg-primary/5"
          >
            <Cake className="h-4 w-4" />
          </Button>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 lg:px-16">
        <div className="mx-auto max-w-6xl space-y-6">
          
          {/* Barra de Filtros */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar producto..."
                className="w-full bg-background pl-9 shadow-sm"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
            <ToggleGroup value={[tipo]} onValueChange={(val) => {
              if (val && val.length > 0) handleTipoChange(val[0] as any)
            }} className="justify-start bg-background p-1 rounded-md shadow-sm border border-input">
              <ToggleGroupItem value="productos" aria-label="Todos">Todos</ToggleGroupItem>
              <ToggleGroupItem value="dulce" aria-label="Dulces">Dulces</ToggleGroupItem>
              <ToggleGroupItem value="salado" aria-label="Salados">Salados</ToggleGroupItem>
              <ToggleGroupItem value="bebida" aria-label="Bebidas">Bebidas</ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Grid de Productos */}
          {isLoadingData ? (
            <div className="flex h-64 items-center justify-center">
              <Loader />
            </div>
          ) : fetchedProductos.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-center text-muted-foreground">
              <p>No se encontraron productos.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {fetchedProductos.map((p) => {
                const stockAgotado = !p.disponible;

                return (
                  <Card key={p.id} className="flex flex-col overflow-hidden transition-all hover:shadow-md border-border/50 h-full">
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted shrink-0">
                      <img
                        src={(p.imagen && p.imagen.trim() !== '' && p.imagen !== 'null' && p.imagen !== 'undefined') ? (p.imagen.startsWith('data:') ? p.imagen : API_URL.replace('/api', '') + p.imagen) : "/placeholder.svg"}
                        alt={p.nombre}
                        className={`absolute inset-0 size-full object-cover transition-transform duration-300 hover:scale-105 ${stockAgotado ? 'opacity-60 grayscale' : ''}`}
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg";
                        }}
                      />
                      <div className="absolute right-2 top-2 flex flex-col gap-1 z-10">
                        <TipoBadge tipo={p.tipo} />
                      </div>
                      {stockAgotado && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40">
                          <span className="rounded-md bg-destructive px-3 py-1 text-sm font-bold text-white shadow-sm">AGOTADO</span>
                        </div>
                      )}
                    </div>
                    <CardContent className="flex flex-grow flex-col p-4 bg-card text-card-foreground">
                      <h3 className="font-medium leading-tight line-clamp-2 min-h-[2.5rem]">{p.nombre}</h3>
                      <div className="mt-auto pt-3 flex items-end justify-between">
                        <div className="flex flex-col">
                          <span className="font-heading text-lg font-bold text-primary">
                            {currency(p.precio)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="mt-8 border-t pt-6 border-border/40">
              <AppPagination 
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={totalItems}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => {
                  setPageSize(size)
                  setCurrentPage(1)
                }}
                itemName="productos"
              />
            </div>
          )}
        </div>
      </main>
    </div>
    </>
  )
}
