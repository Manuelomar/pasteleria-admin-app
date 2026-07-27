"use client"

import { useMemo, useState, useEffect, useCallback } from "react"
import { DollarSign, ShoppingBag, Users, Package, AlertCircle, TrendingUp, Wallet, Percent } from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Cell,
  Pie,
  PieChart,
} from "recharts"
import { toast } from "sonner"
import { StatCard } from "@/components/stat-card"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { EstadoPagoBadge } from "@/components/badges"
import { currency, type Venta, type Cliente, type Producto } from "@/types"
import { api } from "@/services"
import { API_URL } from "@/services/api.config"
import { Loader } from "@/components/ui/loader"
import { LoadingOverlay } from "@/components/ui/loading-overlay"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

const MetricsRow = ({ title, data }: { title?: string, data: any }) => {
  const d = data || { ventas: 0, ganancia: 0, sinItbis: 0, itbis: 0, ordenes: 0 }
  return (
  <div className="mb-8">
    {title && <h2 className="mb-4 text-lg font-heading font-semibold text-foreground">{title}</h2>}
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <Card className="border-border bg-card/50 shadow-sm">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <DollarSign className="size-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-muted-foreground">Ventas Totales</span>
            <div className="flex items-end gap-2">
              <span className="font-heading text-lg font-bold text-foreground">{currency(d.ventas)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card/50 shadow-sm">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex size-11 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <DollarSign className="size-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-muted-foreground">Ganancia Neta</span>
            <span className="font-heading text-lg font-bold text-foreground">{currency(d.ganancia)}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card/50 shadow-sm">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex size-11 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <TrendingUp className="size-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-muted-foreground">Ventas Sin ITBIS</span>
            <span className="font-heading text-lg font-bold text-foreground">{currency(d.sinItbis)}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card/50 shadow-sm">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex size-11 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <Percent className="size-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-muted-foreground">ITBIS Recaudado</span>
            <span className="font-heading text-lg font-bold text-foreground">{currency(d.itbis)}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card/50 shadow-sm">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex size-11 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Wallet className="size-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-muted-foreground">Ticket Promedio</span>
            <span className="font-heading text-lg font-bold text-foreground">{currency(d.ordenes > 0 ? d.ventas / d.ordenes : 0)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
  )
}

export function DashboardModule() {
  const [metrics, setMetrics] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [filterType, setFilterType] = useState("hoy")
  const [customStart, setCustomStart] = useState("")
  const [customEnd, setCustomEnd] = useState("")

  const loadMetrics = useCallback(() => {
    setIsLoading(true)
    const isCustom = filterType === "custom"
    const start = isCustom ? customStart : undefined
    const end = isCustom ? customEnd : undefined

    api.ventas.getDashboardMetrics(start, end)
      .then((data: any) => {
        setMetrics(data)
      })
      .catch((err: any) => {
        console.error(err)
        toast.error("Error cargando dashboard")
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [filterType, customStart, customEnd])

  useEffect(() => {
    if (filterType !== "custom") {
      loadMetrics()
    }
  }, [filterType, loadMetrics])

  useEffect(() => {
    if (filterType === "custom" && customStart && customEnd) {
      loadMetrics()
    }
  }, [customStart, customEnd, filterType, loadMetrics])

  const {
    stats = { hoy: null, semana: null, mes: null, anio: null, custom: null },
    ventasSemanales = [],
    ventasMensuales = [],
    ventasPorCategoria = [],
    metodosPago = [],
    masVendidos = [],
    productosDisp = 0,
    porCobrar = 0,
    ventasRecientes = []
  } = metrics || {}

  

  return (
    <div className="flex flex-col gap-8 relative min-h-[400px]">
      <LoadingOverlay active={isLoading} />
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl font-heading font-semibold text-foreground">
            Resumen de Métricas
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 items-center w-full sm:w-auto">
            {filterType === "custom" && (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Input type="date" value={customStart} onChange={(e: any) => setCustomStart(e.target.value)} className="w-full sm:w-[140px]" />
                <span className="text-muted-foreground hidden sm:inline">-</span>
                <Input type="date" value={customEnd} onChange={(e: any) => setCustomEnd(e.target.value)} className="w-full sm:w-[140px]" />
              </div>
            )}
            <Select value={filterType} onValueChange={(val: string | null) => setFilterType(val || "hoy")}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Seleccionar periodo">
                  {{
                    hoy: "Hoy",
                    semana: "Última Semana",
                    mes: "Este Mes",
                    anio: "Este Año",
                    custom: "Personalizado...",
                  }[filterType] || "Seleccionar periodo"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hoy">Hoy</SelectItem>
                <SelectItem value="semana">Última Semana</SelectItem>
                <SelectItem value="mes">Este Mes</SelectItem>
                <SelectItem value="anio">Este Año</SelectItem>
                <SelectItem value="custom">Personalizado...</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <MetricsRow data={stats[filterType as keyof typeof stats] || stats.hoy} />
      </div>



      {/* SECCIÓN: Gráficas de Rendimiento */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Evolución de Ventas e ITBIS</CardTitle>
            <CardDescription>Comparativa de facturación con y sin impuestos en el año</CardDescription>
          </CardHeader>
          <CardContent>
            {ventasMensuales.some((v: any) => v.ventas > 0) ? (
              <ChartContainer 
                config={{ 
                  subtotal: { label: "Sin ITBIS", color: "var(--chart-2)" }, 
                  impuesto: { label: "ITBIS", color: "var(--chart-1)" } 
                }} 
                className="h-[280px] w-full"
              >
                <BarChart data={ventasMensuales}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="mes" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="subtotal" stackId="a" fill="var(--color-subtotal)" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="impuesto" stackId="a" fill="var(--color-impuesto)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex h-[280px] items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground text-sm">
                No hay ventas este año
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Ventas de la semana</CardTitle>
            <CardDescription>Total facturado por día (últimos 7 días)</CardDescription>
          </CardHeader>
          <CardContent>
            {ventasSemanales.some((v: any) => v.ventas > 0) ? (
              <ChartContainer
                config={{ ventas: { label: "Ventas", color: "var(--chart-1)" } }}
                className="h-[280px] w-full"
              >
                <BarChart data={ventasSemanales}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="dia" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="ventas" fill="var(--color-ventas)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            ) : (
               <div className="flex h-[280px] items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground text-sm">
                  No hay ventas en la última semana
               </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ventas por categoría</CardTitle>
            <CardDescription>Distribución general</CardDescription>
          </CardHeader>
          <CardContent>
            {ventasPorCategoria.length > 0 ? (
              <ChartContainer
                config={{
                  Dulce: { label: "Dulce", color: "var(--chart-1)" },
                  Salado: { label: "Salado", color: "var(--chart-2)" },
                  Bebida: { label: "Bebida", color: "var(--chart-3)" },
                }}
                className="mx-auto h-[280px] w-full"
              >
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie data={ventasPorCategoria} dataKey="valor" nameKey="categoria" innerRadius={60} outerRadius={85} paddingAngle={4}>
                    {ventasPorCategoria.map((entry: any) => (
                      <Cell key={entry.categoria} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartLegend content={<ChartLegendContent nameKey="categoria" />} />
                </PieChart>
              </ChartContainer>
            ) : (
               <div className="flex h-[280px] items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground text-sm">
                  Sin datos de categorías
               </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Métodos de Pago Preferidos</CardTitle>
            <CardDescription>Distribución de transacciones</CardDescription>
          </CardHeader>
          <CardContent>
            {metodosPago.length > 0 ? (
              <ChartContainer
                config={{ 
                  Efectivo: { label: "Efectivo", color: "var(--chart-1)" }, 
                  Tarjeta: { label: "Tarjeta", color: "var(--chart-2)" }, 
                  Transferencia: { label: "Transferencia", color: "var(--chart-3)" } 
                }}
                className="mx-auto h-[280px] w-full"
              >
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie data={metodosPago} dataKey="valor" nameKey="metodo" innerRadius={60} outerRadius={85} paddingAngle={4}>
                    {metodosPago.map((entry: any) => <Cell key={entry.metodo} fill={entry.fill} />)}
                  </Pie>
                  <ChartLegend content={<ChartLegendContent nameKey="metodo" />} />
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="flex h-[280px] items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground text-sm">
                Sin transacciones
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* SECCIÓN: Movimientos Recientes */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Últimas ventas</CardTitle>
            <CardDescription>Movimientos recientes</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {ventasRecientes.length > 0 ? ventasRecientes.map((v: any) => (
              <div key={v.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">{v.cliente?.nombre || v.clienteNombre || "Cliente General"}</span>
                  <span className="text-xs text-muted-foreground">
                    {v.factura} · {v.items.length} producto(s)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <EstadoPagoBadge estado={v.estadoPago} />
                  <span className="font-heading text-sm font-semibold text-foreground">{currency(v.total)}</span>
                </div>
              </div>
            )) : (
              <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                No hay ventas recientes
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Productos más vendidos</CardTitle>
            <CardDescription>Top 5 general</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {masVendidos.length > 0 ? masVendidos.map((p: any, i: number) => (
              <div key={p.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {i + 1}
                </span>
                <img
                  src={p.imagen && p.imagen.trim() !== '' && p.imagen !== 'null' ? (p.imagen.startsWith('data:') ? p.imagen : API_URL.replace('/api', '') + p.imagen) : "/placeholder.svg"}
                  alt={p.nombre}
                  className="size-10 rounded-md object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                />
                <div className="flex flex-1 flex-col">
                  <span className="text-sm font-medium text-foreground">{p.nombre}</span>
                  <span className="text-xs text-muted-foreground">{p.categoria}</span>
                </div>
                <span className="text-sm font-semibold text-foreground">{p.vendidos} uds</span>
              </div>
            )) : (
              <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                No hay productos
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
