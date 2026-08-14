'use client'

import { useState, useEffect } from 'react'
import { api } from '@/services'
import { type Producto } from '@/types'
import { ComboProductGrid } from './ComboProductGrid'
import { ComboSummary } from './ComboSummary'
import { toast } from 'sonner'
import { Loader } from '@/components/ui/loader'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

import { AppPagination } from '@/components/ui/app-pagination'

export type CartItem = {
  producto: Producto
  cantidad: number
}

export function ComboBuilder() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [cart, setCart] = useState<Record<string, CartItem>>({})
  const [tipoFiltro, setTipoFiltro] = useState<string>('todos')

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(12)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    setIsLoading(true)
    api.productos.getPublicPaged(currentPage, pageSize, '', tipoFiltro)
      .then((res) => {
        setProductos(res.data)
        setTotalItems(res.total)
        setTotalPages(res.totalPages)
      })
      .catch(() => toast.error('Error cargando los productos'))
      .finally(() => setIsLoading(false))
  }, [currentPage, pageSize, tipoFiltro])

  const handleUpdateQuantity = (producto: Producto, delta: number) => {
    setCart((prev) => {
      const existing = prev[producto.id]
      const currentQty = existing ? existing.cantidad : 0
      const newQty = currentQty + delta

      if (newQty <= 0) {
        const newCart = { ...prev }
        delete newCart[producto.id]
        return newCart
      }

      return {
        ...prev,
        [producto.id]: {
          producto,
          cantidad: newQty,
        }
      }
    })
  }

  const handleClearCart = () => setCart({})

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <header className="mb-10 text-center">
        <h1 className="font-heading text-3xl font-bold text-foreground md:text-4xl">
          Arma tu Combo
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          Selecciona los productos que desees. Obtendrás un descuento automático según la cantidad de artículos que lleves: a partir de 5 art. (5%), a partir de 9 art. (8%), a partir de 15 art. (10%).
        </p>
      </header>

      <div className="mb-6 flex overflow-x-auto pb-2">
        <ToggleGroup 
          value={[tipoFiltro]} 
          onValueChange={(val) => { if (val && val.length > 0) setTipoFiltro(val[0]) }} 
          className="justify-start bg-background p-1 rounded-md shadow-sm border border-input"
        >
          <ToggleGroupItem value="todos" aria-label="Todos">Todos</ToggleGroupItem>
          <ToggleGroupItem value="dulce" aria-label="Dulces">Dulces</ToggleGroupItem>
          <ToggleGroupItem value="salado" aria-label="Salados">Salados</ToggleGroupItem>
          <ToggleGroupItem value="bebida" aria-label="Bebidas">Bebidas</ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <ComboProductGrid 
            productos={productos} 
            cart={cart} 
            onUpdateQuantity={handleUpdateQuantity} 
          />
          {totalPages > 1 && (
            <div className="mt-8">
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
        <div className="lg:col-span-4">
          <div className="sticky top-24">
            <ComboSummary 
              cart={cart} 
              onClearCart={handleClearCart} 
            />
          </div>
        </div>
      </div>
    </div>
  )
}
