"use client"

import { useState, useEffect } from "react"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import { DollarSign, Percent, TrendingUp, Briefcase, Package, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { currency } from "@/types"
import { api } from "@/services"
import { toast } from "sonner"

interface DistributionConfig {
  reabastecimiento: number
  sueldo: number
  reinversion: number
  ganancia: number
}

const defaultRecommended: DistributionConfig = {
  reabastecimiento: 40,
  sueldo: 25,
  reinversion: 20,
  ganancia: 15,
}

const COLORS = {
  reabastecimiento: "var(--color-1, #3b82f6)", // blue
  sueldo: "var(--color-2, #8b5cf6)", // purple
  reinversion: "var(--color-3, #f59e0b)", // amber
  ganancia: "var(--color-4, #10b981)", // emerald
}

export function IncomeDistribution() {
  const [filterType, setFilterType] = useState("mes")
  const [customStart, setCustomStart] = useState("")
  const [customEnd, setCustomEnd] = useState("")
  const [fetchedTotal, setFetchedTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const [totalIncome, setTotalIncome] = useState<number | "">(0)
  const [isCustom, setIsCustom] = useState(false)
  const [config, setConfig] = useState<DistributionConfig>(defaultRecommended)
  const [isLoaded, setIsLoaded] = useState(false)

  // Fetch metrics whenever filter changes
  useEffect(() => {
    let active = true
    setIsLoading(true)
    const isCustomFilter = filterType === "custom"
    const start = isCustomFilter ? customStart : undefined
    const end = isCustomFilter ? customEnd : undefined

    if (isCustomFilter && (!start || !end)) {
      setIsLoading(false)
      return // wait for dates
    }

    api.ventas.getDashboardMetrics(start, end)
      .then((data: any) => {
        if (!active) return
        const stats = data.stats || {}
        const filterKey = isCustomFilter ? "custom" : filterType
        const ventasDelPeriodo = stats[filterKey]?.ventas || 0
        setFetchedTotal(ventasDelPeriodo)
      })
      .catch((err: any) => {
        if (!active) return
        console.error(err)
        toast.error("Error cargando los ingresos del periodo")
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => { active = false }
  }, [filterType, customStart, customEnd])

  // Sync totalIncome with fetchedTotal if not in manual custom mode
  useEffect(() => {
    if (!isCustom) {
      setTotalIncome(fetchedTotal)
    }
  }, [fetchedTotal, isCustom])

  useEffect(() => {
    const saved = localStorage.getItem("bizcochao_income_distribution")
    if (saved) {
      try {
        setConfig(JSON.parse(saved))
      } catch (e) {
        // use default
      }
    }
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("bizcochao_income_distribution", JSON.stringify(config))
    }
  }, [config, isLoaded])

  const totalPercentage = config.reabastecimiento + config.sueldo + config.reinversion + config.ganancia

  const handleSliderChange = (key: keyof DistributionConfig, value: number) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  const applyRecommendation = () => {
    setConfig(defaultRecommended)
  }

  const chartData = [
    { name: "Reabastecimiento", value: config.reabastecimiento, fill: COLORS.reabastecimiento },
    { name: "Sueldo", value: config.sueldo, fill: COLORS.sueldo },
    { name: "Reinversión", value: config.reinversion, fill: COLORS.reinversion },
    { name: "Ganancia Personal", value: config.ganancia, fill: COLORS.ganancia },
  ].filter(item => item.value > 0)

  if (!isLoaded) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-heading font-semibold text-foreground">Distribución de Ingresos</h2>
          <p className="text-sm text-muted-foreground">Calcula cómo dividir tus ingresos para mantener la salud financiera de tu negocio.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={applyRecommendation} variant="secondary" className="gap-2 shrink-0">
            <Sparkles className="size-4 text-amber-500" />
            <span className="hidden sm:inline">Usar Recomendación</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-xl">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
        {/* Panel de Configuración */}
        <Card className="lg:col-span-2 shadow-sm border-border">
          <CardHeader>
            <CardTitle>Configurador</CardTitle>
            <CardDescription>Ajusta el monto base y los porcentajes deseados.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-secondary/30 p-3 rounded-lg border border-border/50">
                <div className="flex-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Periodo de Ingresos</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="w-full sm:w-[160px] bg-background">
                        <SelectValue placeholder="Periodo">
                          {{
                            hoy: "Hoy",
                            semana: "Última Semana",
                            mes: "Este Mes",
                            anio: "Este Año",
                            custom: "Personalizado...",
                          }[filterType] || "Periodo"}
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
                    
                    {filterType === "custom" && (
                      <div className="flex items-center gap-2">
                        <Input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="w-full sm:w-[130px] bg-background text-sm" />
                        <span className="text-muted-foreground">-</span>
                        <Input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="w-full sm:w-[130px] bg-background text-sm" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Monto Base a Distribuir (RD$)</label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <Input
                    type="number"
                    value={totalIncome === "" ? "" : totalIncome}
                    onChange={(e) => {
                      setTotalIncome(e.target.value === "" ? "" : Number(e.target.value))
                      setIsCustom(true)
                    }}
                    className="max-w-xs font-semibold text-lg"
                  />
                  {isCustom ? (
                    <Button variant="ghost" size="sm" onClick={() => {
                      setIsCustom(false)
                      setTotalIncome(fetchedTotal)
                    }}>
                      Usar ingresos del periodo
                    </Button>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-1 sm:mt-0">Sincronizado con ingresos del {filterType === 'mes' ? 'mes' : 'periodo seleccionado'}.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
              {/* Sliders */}
              {[
                { key: "reabastecimiento", label: "Reabastecimiento", desc: "Materia prima, empaques", color: "text-blue-500", icon: Package },
                { key: "sueldo", label: "Sueldo (Operativo)", desc: "Pago por tu trabajo", color: "text-purple-500", icon: Briefcase },
                { key: "reinversion", label: "Reinversión", desc: "Equipos, marketing, mejoras", color: "text-amber-500", icon: TrendingUp },
                { key: "ganancia", label: "Ganancia Personal", desc: "Beneficio neto del negocio", color: "text-emerald-500", icon: DollarSign },
              ].map((item) => {
                const Icon = item.icon
                const val = config[item.key as keyof DistributionConfig]
                const amount = ((Number(totalIncome) || 0) * val) / 100
                return (
                  <div key={item.key} className="flex flex-col gap-3 p-4 rounded-lg bg-secondary/50 border border-border/50">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <Icon className={`size-4 ${item.color}`} />
                        <span className="font-semibold text-sm">{item.label}</span>
                      </div>
                      <span className="font-heading font-bold">{val}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground -mt-1">{item.desc}</p>
                    
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={val}
                      onChange={(e) => handleSliderChange(item.key as keyof DistributionConfig, Number(e.target.value))}
                      className="w-full cursor-pointer accent-primary"
                    />
                    
                    <div className="flex justify-end mt-1">
                      <span className="text-sm font-semibold">{currency(amount)}</span>
                    </div>
                  </div>
                )
              })}
            </div>

            {totalPercentage !== 100 && (
              <div className={`p-3 rounded-md text-sm font-medium ${totalPercentage > 100 ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'}`}>
                El total de los porcentajes es {totalPercentage}%. Debería sumar exactamente 100%.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Panel de Gráfico */}
        <Card className="shadow-sm border-border flex flex-col">
          <CardHeader>
            <CardTitle>Vista General</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center min-h-[300px]">
            {Number(totalIncome) > 0 && totalPercentage > 0 ? (
              <div className="w-full h-[250px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any, name: any) => [`${value}% - ${currency(((Number(totalIncome) || 0) * (Number(value) || 0)) / 100)}`, name]}
                      contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Total en el centro */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Total</span>
                  <span className="text-lg font-heading font-bold">{currency(Number(totalIncome) || 0)}</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-muted-foreground text-sm gap-2">
                <Percent className="size-8 opacity-20" />
                <span>Ingresa un monto para ver el gráfico</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
