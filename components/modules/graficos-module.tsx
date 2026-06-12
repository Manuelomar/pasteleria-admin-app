"use client"

import { useMemo, useState, useEffect } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell, Pie, PieChart, AreaChart, Area } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { currency, type Venta, type Producto } from "@/lib/data"
import { api } from "@/lib/api"
import { TrendingUp, DollarSign, Wallet, Percent, Download, RefreshCw } from "lucide-react"

export function GraficosModule() {
  const [periodo, setPeriodo] = useState("este-mes")
  const [ventas, setVentas] = useState<Venta[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = () => {
    setIsLoading(true)
    Promise.all([
      api.ventas.getAll(),
      api.productos.getAll()
    ]).then(([v, p]) => {
      setVentas(v)
      setProductos(p)
    }).catch(err => {
      console.error(err)
      toast.error("Error cargando datos para gráficos")
    }).finally(() => {
      setIsLoading(false)
    })
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Derived metrics
  const { totalFacturadoMes, totalVentasAnio, promedioOrden } = useMemo(() => {
    const today = new Date()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()
    
    let mes = 0
    let anio = 0
    let sumTotal = 0

    ventas.forEach(v => {
      const date = new Date(v.fecha)
      sumTotal += v.total
      if (date.getFullYear() === currentYear) {
        anio += v.total
        if (date.getMonth() === currentMonth) {
          mes += v.total
        }
      }
    })

    return {
      totalFacturadoMes: mes,
      totalVentasAnio: anio,
      promedioOrden: ventas.length > 0 ? sumTotal / ventas.length : 0
    }
  }, [ventas])

  const ventasSemanales = useMemo(() => {
    const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
    const data = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split("T")[0]
      const sum = ventas.filter(v => new Date(v.fecha).toISOString().split("T")[0] === dateStr).reduce((s, v) => s + v.total, 0)
      data.push({ dia: days[d.getDay()], ventas: sum })
    }
    return data
  }, [ventas])

  const ventasMensuales = useMemo(() => {
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
    const data = months.map(mes => ({ mes, ventas: 0 }))
    
    const currentYear = new Date().getFullYear()
    ventas.forEach(v => {
      const date = new Date(v.fecha)
      if (date.getFullYear() === currentYear) {
        data[date.getMonth()].ventas += v.total
      }
    })
    
    return data
  }, [ventas])

  const ventasPorCategoria = useMemo(() => {
    const colors: Record<string, string> = {
      Dulce: "var(--color-chart-1)",
      Salado: "var(--color-chart-2)",
      Bebida: "var(--color-chart-3)",
    }
    const catMap: Record<string, number> = { Dulce: 0, Salado: 0, Bebida: 0 }
    
    ventas.forEach(v => {
      v.items.forEach(item => {
        const prod = productos.find(p => p.id === item.productoId)
        if (prod) {
          const cat = prod.tipo === "dulce" ? "Dulce" : prod.tipo === "salado" ? "Salado" : "Bebida"
          catMap[cat] += item.precio * item.cantidad
        }
      })
    })

    return Object.keys(catMap).map(k => ({
      categoria: k,
      valor: catMap[k],
      fill: colors[k] || "var(--color-chart-1)"
    })).filter(x => x.valor > 0)
  }, [ventas, productos])

  const metodosPago = useMemo(() => {
    const colors: Record<string, string> = {
      Efectivo: "var(--color-chart-1)",
      Tarjeta: "var(--color-chart-2)",
      Transferencia: "var(--color-chart-3)",
    }
    const map: Record<string, number> = { Efectivo: 0, Tarjeta: 0, Transferencia: 0 }
    
    ventas.forEach(v => {
      const met = v.metodoPago === "efectivo" ? "Efectivo" : v.metodoPago === "tarjeta" ? "Tarjeta" : "Transferencia"
      map[met] += v.total
    })

    return Object.keys(map).map(k => ({
      metodo: k,
      valor: map[k],
      fill: colors[k] || "var(--color-chart-1)"
    })).filter(x => x.valor > 0)
  }, [ventas])

  const topCategoria = useMemo(() => {
    if (ventasPorCategoria.length === 0) return "N/A"
    return ventasPorCategoria.reduce((prev, curr) => (prev.valor > curr.valor) ? prev : curr).categoria
  }, [ventasPorCategoria])

  const topMetodoPago = useMemo(() => {
    if (metodosPago.length === 0) return "N/A"
    return metodosPago.reduce((prev, curr) => (prev.valor > curr.valor) ? prev : curr).metodo
  }, [metodosPago])

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 text-muted-foreground">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p>Cargando gráficas y reportes...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-border bg-card/50 p-4 backdrop-blur-sm sm:flex-row sm:items-center">
        <div>
          <h2 className="font-heading text-lg font-semibold text-foreground">Reportes Financieros y Métricas</h2>
          <p className="text-xs text-muted-foreground">Monitorea el rendimiento de ventas y preferencias de pago.</p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Select value={periodo} onValueChange={(v) => v && setPeriodo(v)}>
            <SelectTrigger className="h-9 w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hoy">Hoy</SelectItem>
              <SelectItem value="esta-semana">Esta Semana</SelectItem>
              <SelectItem value="este-mes">Este Mes</SelectItem>
              <SelectItem value="este-anio">Este Año</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={() => { fetchData(); toast.success("Métricas actualizadas") }}>
            <RefreshCw className="size-4" />
          </Button>

          <Button variant="outline" size="sm" onClick={() => toast.success("Exportando reportes financieros completos...")}>
            <Download className="size-4" />
            <span>Descargar PDF</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-card/50 shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <DollarSign className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-muted-foreground">Total Facturado (Año)</span>
              <span className="font-heading text-lg font-bold text-foreground">{currency(totalVentasAnio)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/50 shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-11 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-muted-foreground">Ventas de {periodo === "este-anio" ? "Año" : "Mes"}</span>
              <span className="font-heading text-lg font-bold text-foreground">{currency(totalFacturadoMes)}</span>
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
              <span className="font-heading text-lg font-bold text-foreground">{currency(promedioOrden)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/50 shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-11 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Percent className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-muted-foreground">Categoría Top</span>
              <span className="font-heading text-base font-bold text-foreground">{topCategoria}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Histórico de Ventas</CardTitle>
            <CardDescription>Evolución de facturación mensual este año</CardDescription>
          </CardHeader>
          <CardContent>
            {ventasMensuales.some(v => v.ventas > 0) ? (
              <ChartContainer config={{ ventas: { label: "Facturado", color: "var(--chart-1)" } }} className="h-[280px] w-full">
                <AreaChart data={ventasMensuales}>
                  <defs>
                    <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-ventas)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--color-ventas)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="mes" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="ventas" stroke="var(--color-ventas)" fillOpacity={1} fill="url(#colorVentas)" strokeWidth={2} />
                </AreaChart>
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
            <CardTitle>Rendimiento Semanal</CardTitle>
            <CardDescription>Detalle de ventas por día de la semana</CardDescription>
          </CardHeader>
          <CardContent>
            {ventasSemanales.some(v => v.ventas > 0) ? (
              <ChartContainer config={{ ventas: { label: "Ventas", color: "var(--chart-2)" } }} className="h-[280px] w-full">
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

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Ventas por Categoría</CardTitle>
            <CardDescription>Composición de la facturación histórica</CardDescription>
          </CardHeader>
          <CardContent>
            {ventasPorCategoria.length > 0 ? (
              <ChartContainer
                config={{ Dulce: { label: "Dulce", color: "var(--chart-1)" }, Salado: { label: "Salado", color: "var(--chart-2)" }, Bebida: { label: "Bebida", color: "var(--chart-3)" } }}
                className="mx-auto h-[280px] w-full"
              >
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie data={ventasPorCategoria} dataKey="valor" nameKey="categoria" innerRadius={60} outerRadius={85} paddingAngle={4}>
                    {ventasPorCategoria.map((entry) => <Cell key={entry.categoria} fill={entry.fill} />)}
                  </Pie>
                  <ChartLegend content={<ChartLegendContent nameKey="categoria" />} />
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="flex h-[280px] items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground text-sm">
                Sin datos
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Métodos de Pago Preferidos</CardTitle>
            <CardDescription>Distribución de transacciones</CardDescription>
          </CardHeader>
          <CardContent>
            {metodosPago.length > 0 ? (
              <ChartContainer
                config={{ Efectivo: { label: "Efectivo", color: "var(--chart-1)" }, Tarjeta: { label: "Tarjeta", color: "var(--chart-2)" }, Transferencia: { label: "Transferencia", color: "var(--chart-3)" } }}
                className="mx-auto h-[280px] w-full"
              >
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie data={metodosPago} dataKey="valor" nameKey="metodo" innerRadius={60} outerRadius={85} paddingAngle={4}>
                    {metodosPago.map((entry) => <Cell key={entry.metodo} fill={entry.fill} />)}
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
    </div>
  )
}
