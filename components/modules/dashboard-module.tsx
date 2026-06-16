"use client"

import { useMemo, useState, useEffect } from "react"
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
import { currency, type Venta, type Cliente, type Producto } from "@/lib/data"
import { api } from "@/lib/api"

export function DashboardModule() {
  const [ventas, setVentas] = useState<Venta[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    Promise.all([
      api.ventas.getAll(),
      api.clientes.getAll(),
      api.productos.getAll()
    ]).then(([v, c, p]) => {
      setVentas(v)
      setClientes(c)
      setProductos(p)
    }).catch(err => {
      console.error(err)
      toast.error("Error cargando dashboard")
    }).finally(() => {
      setIsLoading(false)
    })
  }, [])

  // Computed Stats - Hoy
  const ventasDia = useMemo(() => {
    const today = new Date().toISOString().split("T")[0]
    return ventas.filter(v => new Date(v.fecha).toISOString().split("T")[0] === today).reduce((s, v) => s + v.total, 0)
  }, [ventas])

  const ordenesDia = useMemo(() => {
    const today = new Date().toISOString().split("T")[0]
    return ventas.filter(v => new Date(v.fecha).toISOString().split("T")[0] === today).length
  }, [ventas])

  const clientesReg = clientes.length
  const productosDisp = productos.filter((p) => p.disponible).length
  const porCobrar = clientes.reduce((s, c) => s + c.balance, 0)

  // Computed Stats - Globales y Financieras
  const { totalVentasAnio, subtotalAnio, impuestoAnio, promedioOrden } = useMemo(() => {
    const today = new Date()
    const currentYear = today.getFullYear()
    
    let sumTotal = 0
    let anio = 0
    let subtotalA = 0
    let impuestoA = 0

    ventas.forEach(v => {
      const date = new Date(v.fecha)
      sumTotal += v.total
      if (date.getFullYear() === currentYear) {
        anio += v.total
        subtotalA += (v.subtotal || 0)
        impuestoA += (v.impuesto || 0)
      }
    })

    return {
      totalVentasAnio: anio,
      promedioOrden: ventas.length > 0 ? sumTotal / ventas.length : 0,
      subtotalAnio: subtotalA,
      impuestoAnio: impuestoA
    }
  }, [ventas])

  const masVendidos = useMemo(() => {
    return [...productos].sort((a, b) => b.vendidos - a.vendidos).slice(0, 5)
  }, [productos])

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
    const data = months.map(mes => ({ mes, ventas: 0, subtotal: 0, impuesto: 0 }))
    
    const currentYear = new Date().getFullYear()
    ventas.forEach(v => {
      const date = new Date(v.fecha)
      if (date.getFullYear() === currentYear) {
        data[date.getMonth()].ventas += v.total
        data[date.getMonth()].subtotal += (v.subtotal || 0)
        data[date.getMonth()].impuesto += (v.impuesto || 0)
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

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 text-muted-foreground">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p>Cargando panel de control...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      
      {/* SECCIÓN: Hoy y Operativo */}
      <div>
        <h2 className="mb-4 text-lg font-heading font-semibold text-foreground">Operativo Hoy</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Ventas del día" value={currency(ventasDia)} icon={DollarSign} accent="primary" hint="Actualizado hoy" />
          <StatCard title="Órdenes del día" value={String(ordenesDia)} icon={ShoppingBag} accent="orange" />
          <StatCard title="Cuentas por cobrar" value={currency(porCobrar)} icon={AlertCircle} accent="primary" />
          <StatCard title="Clientes registrados" value={String(clientesReg)} icon={Users} accent="muted" />
        </div>
      </div>

      {/* SECCIÓN: Finanzas e Impuestos */}
      <div>
        <h2 className="mb-4 text-lg font-heading font-semibold text-foreground">Métricas Financieras (Año)</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border bg-card/50 shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <DollarSign className="size-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-muted-foreground">Total Facturado</span>
                <div className="flex items-end gap-2">
                  <span className="font-heading text-lg font-bold text-foreground">{currency(totalVentasAnio)}</span>
                  <span className="text-[10px] text-muted-foreground mb-1">con ITBIS</span>
                </div>
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
                <span className="font-heading text-lg font-bold text-foreground">{currency(subtotalAnio)}</span>
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
                <span className="font-heading text-lg font-bold text-foreground">{currency(impuestoAnio)}</span>
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
        </div>
      </div>

      {/* SECCIÓN: Gráficas de Rendimiento */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Evolución de Ventas e ITBIS</CardTitle>
            <CardDescription>Comparativa de facturación con y sin impuestos en el año</CardDescription>
          </CardHeader>
          <CardContent>
            {ventasMensuales.some(v => v.ventas > 0) ? (
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
            {ventasSemanales.some(v => v.ventas > 0) ? (
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
                    {ventasPorCategoria.map((entry) => (
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

      {/* SECCIÓN: Movimientos Recientes */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Últimas ventas</CardTitle>
            <CardDescription>Movimientos recientes</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {ventas.length > 0 ? ventas.slice(0, 5).map((v) => (
              <div key={v.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">{v.clienteNombre || "Cliente General"}</span>
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
            {masVendidos.length > 0 ? masVendidos.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {i + 1}
                </span>
                <img
                  src={p.imagen || "/placeholder.svg"}
                  alt={p.nombre}
                  className="size-10 rounded-md object-cover"
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
