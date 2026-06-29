import { useState, useRef } from "react"
import { api } from "@/services"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Loader } from "@/components/ui/loader"
import { Printer, Calendar, CalendarDays, CalendarRange } from "lucide-react"

export function ReportesModule() {
  const [activeTab, setActiveTab] = useState("proveedor")
  const [loading, setLoading] = useState(false)
  const [reportHtml, setReportHtml] = useState<string | null>(null)
  
  // Filtros
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  const [entregado, setEntregado] = useState(false)
  const [noPagado, setNoPagado] = useState(false)
  const [finalizado, setFinalizado] = useState(false)

  const iframeRef = useRef<HTMLIFrameElement>(null)

  const handleQuickDate = (type: 'semana' | 'mes' | 'año') => {
    const end = new Date()
    const start = new Date()

    if (type === 'semana') {
      start.setDate(end.getDate() - 7)
    } else if (type === 'mes') {
      start.setMonth(end.getMonth() - 1)
    } else if (type === 'año') {
      start.setFullYear(end.getFullYear() - 1)
    }

    setFechaInicio(start.toISOString().split('T')[0])
    setFechaFin(end.toISOString().split('T')[0])
  }

  const generarReporte = async () => {
    setLoading(true)
    setReportHtml(null)
    try {
      if (activeTab === "proveedor") {
        const html = await api.reportes.getReporteProveedor({
          fechaInicio,
          fechaFin,
          entregado,
          noPagado,
          finalizado,
        })
        setReportHtml(html)
      }
    } catch (error) {
      console.error("Error al generar reporte", error)
    } finally {
      setLoading(false)
    }
  }

  const imprimirReporte = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.print()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reportes</h2>
          <p className="text-muted-foreground">Genera y visualiza reportes del sistema.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="proveedor">Reporte de Proveedores</TabsTrigger>
          <TabsTrigger value="ventas" disabled>Reporte de Ventas (Próximamente)</TabsTrigger>
        </TabsList>

        <TabsContent value="proveedor" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Filtros del Reporte</CardTitle>
              <CardDescription>Configura los parámetros para generar el reporte de entregas de proveedores.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-semibold mb-3 block">Rango de Fechas</Label>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Button variant="outline" size="sm" onClick={() => handleQuickDate('semana')}>
                        <CalendarDays className="mr-2 h-4 w-4" />
                        Última Semana
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleQuickDate('mes')}>
                        <Calendar className="mr-2 h-4 w-4" />
                        Último Mes
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleQuickDate('año')}>
                        <CalendarRange className="mr-2 h-4 w-4" />
                        Último Año
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => {
                        setFechaInicio("")
                        setFechaFin("")
                      }}>
                        Limpiar Fechas
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Fecha Inicio</Label>
                        <Input 
                          type="date" 
                          value={fechaInicio} 
                          onChange={(e) => setFechaInicio(e.target.value)} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Fecha Fin</Label>
                        <Input 
                          type="date" 
                          value={fechaFin} 
                          onChange={(e) => setFechaFin(e.target.value)} 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-semibold mb-3 block">Estados</Label>
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="entregado" 
                        checked={entregado} 
                        onCheckedChange={(c: boolean | "indeterminate") => setEntregado(!!c)} 
                      />
                      <Label htmlFor="entregado" className="font-normal">Entregado</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="noPagado" 
                        checked={noPagado} 
                        onCheckedChange={(c: boolean | "indeterminate") => setNoPagado(!!c)} 
                      />
                      <Label htmlFor="noPagado" className="font-normal">No Pagado</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="finalizado" 
                        checked={finalizado} 
                        onCheckedChange={(c: boolean | "indeterminate") => setFinalizado(!!c)} 
                      />
                      <Label htmlFor="finalizado" className="font-normal">Finalizado (Entregado y Pagado)</Label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <Button onClick={generarReporte} disabled={loading} className="w-full md:w-auto">
                  {loading ? <Loader className="mr-2 h-4 w-4" /> : null}
                  Generar Reporte
                </Button>
              </div>
            </CardContent>
          </Card>

          {reportHtml && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Vista Previa del Reporte</CardTitle>
                  <CardDescription>Revisa el reporte antes de imprimirlo o descargarlo.</CardDescription>
                </div>
                <Button variant="secondary" onClick={imprimirReporte}>
                  <Printer className="mr-2 h-4 w-4" />
                  Imprimir
                </Button>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md bg-white shadow-sm" style={{ height: "600px", overflow: "hidden" }}>
                  <iframe 
                    ref={iframeRef}
                    srcDoc={reportHtml} 
                    style={{ width: "100%", height: "100%", border: "none" }}
                    title="Reporte Generado"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
