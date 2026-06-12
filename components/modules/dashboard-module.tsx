"use client"

import { useMemo, useState, useEffect } from "react"
import { DollarSign, ShoppingBag, Users, Package, AlertCircle, TrendingUp } from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
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

  // Computed Stats
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

  const masVendidos = useMemo(() => {
    return [...productos].sort((a, b) => b.vendidos - a.vendidos).slice(0, 5)
  }, [productos])

  const ventasSemanales = useMemo(() => {
    // Ultimos 7 dias
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

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 text-muted-foreground">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p>Cargando panel de control...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard title="Ventas del día" value={currency(ventasDia)} icon={DollarSign} accent="primary" hint="Actualizado hoy" />
        <StatCard title="Ventas totales" value={currency(ventas.reduce((s, v) => s + v.total, 0))} icon={TrendingUp} accent="green" hint="Histórico" />
        <StatCard title="Órdenes del día" value={String(ordenesDia)} icon={ShoppingBag} accent="orange" />
        <StatCard title="Clientes registrados" value={String(clientesReg)} icon={Users} accent="muted" />
        <StatCard title="Productos disponibles" value={String(productosDisp)} icon={Package} accent="green" />
        <StatCard title="Cuentas por cobrar" value={currency(porCobrar)} icon={AlertCircle} accent="primary" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
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
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="ventas" fill="var(--color-ventas)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ChartContainer>
            ) : (
               <div className="flex h-[280px] items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground text-sm">
                  No hay ventas en la última semana
               </div>
            )}
          </CardContent>
        </Card>

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
                  <Pie data={ventasPorCategoria} dataKey="valor" nameKey="categoria" innerRadius={55}>
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
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
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
