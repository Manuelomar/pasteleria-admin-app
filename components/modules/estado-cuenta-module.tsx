"use client"

import { useState, useEffect } from "react"
import { Calendar as CalendarIcon, Download, Wallet, CreditCard, DollarSign, TrendingUp, PieChart } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AppPagination } from "@/components/ui/app-pagination"
import { currency, type Venta } from "@/lib/data"
import { api } from "@/lib/api"

interface ResumenCaja {
  efectivo: number;
  tarjeta: number;
  transferencia: number;
  total: number;
  cantidad: number;
}

interface ResumenHistorico {
  total: number;
  cantidad: number;
}

interface TopProduct {
  nombre: string;
  productoId: string;
  cantidad: number;
  total: number;
}

export function EstadoCuentaModule() {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0])
  
  // Paginación y Estado de Caja
  const [pageCaja, setPageCaja] = useState(1)
  const pageSizeCaja = 5
  const [ventasDelDia, setVentasDelDia] = useState<Venta[]>([])
  const [totalItemsCaja, setTotalItemsCaja] = useState(0)
  const [totalPagesCaja, setTotalPagesCaja] = useState(0)
  const [resumenCaja, setResumenCaja] = useState<ResumenCaja>({ efectivo: 0, tarjeta: 0, transferencia: 0, total: 0, cantidad: 0 })
  const [isLoadingCaja, setIsLoadingCaja] = useState(true)

  // Paginación y Estado de Reporte
  const [pageReporte, setPageReporte] = useState(1)
  const pageSizeReporte = 5
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [totalItemsReporte, setTotalItemsReporte] = useState(0)
  const [totalPagesReporte, setTotalPagesReporte] = useState(0)
  const [ventasHistoricas, setVentasHistoricas] = useState<ResumenHistorico>({ total: 0, cantidad: 0 })
  const [isLoadingReporte, setIsLoadingReporte] = useState(true)

  // Reset page when date changes
  useEffect(() => {
    setPageCaja(1)
  }, [selectedDate])

  // Cargar datos de Caja (Ventas Paginadas y Resumen)
  useEffect(() => {
    setIsLoadingCaja(true)
    Promise.all([
      api.ventas.getPaged(pageCaja, pageSizeCaja, selectedDate),
      api.ventas.getResumenCaja(selectedDate)
    ]).then(([ventasPaged, resumen]) => {
      setVentasDelDia(ventasPaged.data)
      setTotalItemsCaja(ventasPaged.total)
      setTotalPagesCaja(ventasPaged.totalPages)
      setResumenCaja(resumen)
    }).catch(err => {
      console.error(err)
      toast.error("Error cargando la información de caja")
    }).finally(() => {
      setIsLoadingCaja(false)
    })
  }, [pageCaja, selectedDate])

  // Cargar datos de Reporte (Histórico y Top Productos Paginados)
  useEffect(() => {
    setIsLoadingReporte(true)
    Promise.all([
      api.ventas.getReporteHistorico(),
      api.ventas.getTopProductos(pageReporte, pageSizeReporte)
    ]).then(([historico, topPaged]) => {
      setVentasHistoricas(historico)
      setTopProducts(topPaged.data)
      setTotalItemsReporte(topPaged.total)
      setTotalPagesReporte(topPaged.totalPages)
    }).catch(err => {
      console.error(err)
      toast.error("Error cargando los reportes de ventas")
    }).finally(() => {
      setIsLoadingReporte(false)
    })
  }, [pageReporte])


  const handleImprimirCierre = () => {
    toast.success("Enviando reporte de cierre a la impresora...")
  }

  return (
    <div className="flex flex-col gap-6">
      <Tabs defaultValue="caja" className="w-full">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <TabsList className="grid w-full grid-cols-2 sm:w-[400px]">
            <TabsTrigger value="caja">Cierre de Caja</TabsTrigger>
            <TabsTrigger value="reporte">Reporte de Ventas</TabsTrigger>
          </TabsList>

          <Button variant="outline" onClick={() => toast.success("Exportando datos a Excel...")}>
            <Download className="mr-2 size-4" />
            Exportar General
          </Button>
        </div>

        {/* PESTAÑA 1: CIERRE DE CAJA */}
        <TabsContent value="caja" className="mt-6 flex flex-col gap-6">
          <div className="flex flex-col justify-between gap-4 rounded-xl border border-border bg-card/50 p-4 backdrop-blur-sm sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <CalendarIcon className="size-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground">Fecha del Arqueo</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent text-sm text-muted-foreground outline-none"
                />
              </div>
            </div>

            <Button onClick={handleImprimirCierre}>
              Cerrar Caja
            </Button>
          </div>

          {isLoadingCaja ? (
            <div className="py-20 text-center text-muted-foreground">Cargando datos de caja...</div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent shadow-sm">
                  <CardContent className="flex items-center gap-4 p-5">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Wallet className="size-6" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ingresos Totales</span>
                      <span className="font-heading text-2xl font-bold text-primary">{currency(resumenCaja.total)}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border bg-card/50 shadow-sm">
                  <CardContent className="flex items-center gap-4 p-5">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <DollarSign className="size-6" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Efectivo</span>
                      <span className="font-heading text-xl font-bold text-foreground">{currency(resumenCaja.efectivo)}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border bg-card/50 shadow-sm">
                  <CardContent className="flex items-center gap-4 p-5">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      <CreditCard className="size-6" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tarjetas</span>
                      <span className="font-heading text-xl font-bold text-foreground">{currency(resumenCaja.tarjeta)}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border bg-card/50 shadow-sm">
                  <CardContent className="flex items-center gap-4 p-5">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                      <TrendingUp className="size-6" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Transferencias</span>
                      <span className="font-heading text-xl font-bold text-foreground">{currency(resumenCaja.transferencia)}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Transacciones del Día ({resumenCaja.cantidad})</CardTitle>
                  <CardDescription>Detalle de todas las ventas registradas en la fecha seleccionada.</CardDescription>
                </CardHeader>
                <CardContent>
                  {ventasDelDia.length > 0 ? (
                    <div className="flex flex-col gap-4">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Factura</TableHead>
                              <TableHead>Hora</TableHead>
                              <TableHead>Cliente</TableHead>
                              <TableHead>Método de Pago</TableHead>
                              <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {ventasDelDia.map(v => {
                              const hora = new Date(v.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              return (
                                <TableRow key={v.id}>
                                  <TableCell className="font-mono text-sm">{v.factura}</TableCell>
                                  <TableCell className="text-sm">{hora}</TableCell>
                                  <TableCell className="text-sm">{v.clienteNombre || "Cliente de Paso"}</TableCell>
                                  <TableCell className="text-sm capitalize">{v.metodoPago}</TableCell>
                                  <TableCell className="text-right font-semibold">{currency(v.total)}</TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      </div>
                      {/* Siempre mostramos el paginador si hay datos, o según el componente internamente */}
                      <AppPagination
                        currentPage={pageCaja}
                        pageSize={pageSizeCaja}
                        totalItems={totalItemsCaja}
                        totalPages={totalPagesCaja}
                        onPageChange={setPageCaja}
                        itemName="ventas"
                      />
                    </div>
                  ) : (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                      No hay ventas registradas para este día.
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* PESTAÑA 2: REPORTE DE VENTAS */}
        <TabsContent value="reporte" className="mt-6 flex flex-col gap-6">
          {isLoadingReporte ? (
            <div className="py-20 text-center text-muted-foreground">Cargando reportes históricos...</div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Card className="border-border bg-card/50 shadow-sm">
                  <CardContent className="flex items-center gap-4 p-5">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
                      <PieChart className="size-6" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ventas Históricas (Total)</span>
                      <span className="font-heading text-2xl font-bold text-foreground">{currency(ventasHistoricas.total)}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border bg-card/50 shadow-sm">
                  <CardContent className="flex items-center gap-4 p-5">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      <TrendingUp className="size-6" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pedidos Totales</span>
                      <span className="font-heading text-2xl font-bold text-foreground">{ventasHistoricas.cantidad} facturas</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Productos Más Vendidos</CardTitle>
                  <CardDescription>Ranking de los productos que generan más ingresos.</CardDescription>
                </CardHeader>
                <CardContent>
                  {topProducts.length > 0 ? (
                    <div className="flex flex-col gap-4">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Producto</TableHead>
                              <TableHead className="text-right">Cantidad Vendida</TableHead>
                              <TableHead className="text-right">Ingresos Generados</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {topProducts.map((p, index) => (
                              <TableRow key={index}>
                                <TableCell className="font-medium">{p.nombre}</TableCell>
                                <TableCell className="text-right">{p.cantidad} unds.</TableCell>
                                <TableCell className="text-right font-semibold text-emerald-600 dark:text-emerald-400">
                                  {currency(p.total)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      <AppPagination
                        currentPage={pageReporte}
                        pageSize={pageSizeReporte}
                        totalItems={totalItemsReporte}
                        totalPages={totalPagesReporte}
                        onPageChange={setPageReporte}
                        itemName="productos"
                      />
                    </div>
                  ) : (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                      No hay datos suficientes para mostrar los productos más vendidos.
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

      </Tabs>
    </div>
  )
}
