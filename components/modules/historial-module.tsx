"use client"

import { useState, useEffect } from "react"
import { Search, History, CalendarIcon, TrendingUp } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { LoadingOverlay } from "@/components/ui/loading-overlay"
import { AppPagination } from "@/components/ui/app-pagination"
import { currency, type Producto } from "@/types"
import { api } from "@/services"

export function HistorialModule() {
  const [desde, setDesde] = useState<string>("")
  const [hasta, setHasta] = useState<string>("")
  const [productoId, setProductoId] = useState<string>("all")
  
  const [productos, setProductos] = useState<Producto[]>([])
  const [historial, setHistorial] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingFiltro, setIsLoadingFiltro] = useState(false)
  
  const [totalCantidad, setTotalCantidad] = useState(0)
  const [totalGenerado, setTotalGenerado] = useState(0)
  const [totalGanancia, setTotalGanancia] = useState(0)

  // Paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  // Cargar productos para el select
  useEffect(() => {
    api.productos.getAll()
      .then(res => setProductos(res.filter((p: any) => p.tipo !== 'material')))
      .catch((err) => console.error("Error al cargar productos", err))
  }, [])

  const loadHistorial = (desdeVal?: string, hastaVal?: string, prodId?: string, page: number = 1) => {
    setIsLoadingFiltro(true)
    api.ventas.getHistorialProductos(desdeVal, hastaVal, prodId, page, pageSize)
      .then((res: any) => {
        setHistorial(res.data)
        setTotalItems(res.total)
        setTotalPages(res.totalPages)
        setCurrentPage(res.page)
        setTotalCantidad(res.overallCantidad)
        setTotalGenerado(res.overallTotal)
        setTotalGanancia(res.overallGanancia || 0)
      })
      .catch((err) => {
        console.error("Error al cargar el historial", err)
        toast.error("Hubo un error cargando el historial de productos")
      })
      .finally(() => {
        setIsLoading(false)
        setIsLoadingFiltro(false)
      })
  }

  // Carga inicial
  useEffect(() => {
    loadHistorial(desde, hasta, productoId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFiltrar = () => {
    setCurrentPage(1)
    loadHistorial(desde, hasta, productoId, 1)
  }

  const handleLimpiar = () => {
    setDesde("")
    setHasta("")
    setProductoId("all")
    setCurrentPage(1)
    loadHistorial("", "", "all", 1)
  }

  // Load when page changes
  useEffect(() => {
    if (!isLoading) {
      loadHistorial(desde, hasta, productoId, currentPage)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage])

  return (
    <div className="flex flex-col gap-5 relative min-h-[400px]">
      <LoadingOverlay active={isLoading} />
      <div className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">
          Consulta el historial de ventas por producto, filtrando por rango de fechas y producto específico.
        </p>
      </div>

      <Card className="border-border bg-card/50 shadow-sm">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Desde
              </label>
              <Input
                type="date"
                value={desde}
                onChange={(e) => setDesde(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Hasta
              </label>
              <Input
                type="date"
                value={hasta}
                onChange={(e) => setHasta(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex flex-col gap-1.5 flex-[1.5]">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Producto
              </label>
              <Select value={productoId} onValueChange={(val) => setProductoId(val || "all")}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los productos">
                    {productoId === "all" ? "Todos los productos" : productos.find(p => p.id === productoId)?.nombre || "Todos los productos"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los productos</SelectItem>
                  {productos.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
              <Button onClick={handleLimpiar} variant="outline" className="flex-1 sm:flex-none">
                Limpiar
              </Button>
              <Button onClick={handleFiltrar} className="flex-1 sm:flex-none" disabled={isLoadingFiltro}>
                {isLoadingFiltro ? "Cargando..." : "Filtrar"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <History className="size-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Productos Vendidos</span>
              <span className="font-heading text-2xl font-bold text-primary">{totalCantidad}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card/50 shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Search className="size-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ingresos</span>
              <span className="font-heading text-2xl font-bold text-foreground">{currency(totalGenerado)}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card/50 shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="size-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ganancia</span>
              <span className="font-heading text-2xl font-bold text-foreground">{currency(totalGanancia)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden p-0 relative min-h-[300px]">
        <LoadingOverlay active={isLoadingFiltro && !isLoading} />
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Factura</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead className="text-center">Cantidad</TableHead>
                <TableHead className="text-right">Precio</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historial.length > 0 ? (
                historial.map((item, index) => (
                  <TableRow key={item.id || index}>
                    <TableCell className="whitespace-nowrap">
                      {item.fecha ? new Date(item.fecha).toLocaleString("es-DO", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false
                      }).replace(",", "") : "-"}
                    </TableCell>
                    <TableCell className="font-medium">{item.factura}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{item.clienteNombre}</TableCell>
                    <TableCell className="font-semibold text-primary">{item.producto}</TableCell>
                    <TableCell className="text-center font-bold">{item.cantidad}</TableCell>
                    <TableCell className="text-right">{currency(item.precio)}</TableCell>
                    <TableCell className="text-right font-bold">{currency(item.total)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    No se encontraron registros de ventas con los filtros seleccionados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Paginación */}
        {totalItems > 0 && (
          <div className="p-4 border-t border-border bg-card/50">
            <AppPagination
              currentPage={currentPage}
              pageSize={pageSize}
              totalItems={totalItems}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemName="registros"
            />
          </div>
        )}
      </Card>
    </div>
  )
}
