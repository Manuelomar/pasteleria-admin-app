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
  const [pagoPendiente, setPagoPendiente] = useState(false)
  const [pagoPagado, setPagoPagado] = useState(false)

  // Filtros Ventas
  const [ventasFechaInicio, setVentasFechaInicio] = useState("")
  const [ventasFechaFin, setVentasFechaFin] = useState("")
  const [metodosPago, setMetodosPago] = useState<string[]>([])

  // Filtros Ganancias
  const [gananciasFechaInicio, setGananciasFechaInicio] = useState("")
  const [gananciasFechaFin, setGananciasFechaFin] = useState("")

  const iframeRef = useRef<HTMLIFrameElement>(null)

  const handleQuickDate = (type: 'semana' | 'mes' | 'año', targetTab: 'proveedor' | 'ventas' | 'ganancias' = 'proveedor') => {
    const end = new Date()
    const start = new Date()

    if (type === 'semana') {
      start.setDate(end.getDate() - 7)
    } else if (type === 'mes') {
      start.setMonth(end.getMonth() - 1)
    } else if (type === 'año') {
      start.setFullYear(end.getFullYear() - 1)
    }

    if (targetTab === 'ventas') {
      setVentasFechaInicio(start.toISOString().split('T')[0])
      setVentasFechaFin(end.toISOString().split('T')[0])
    } else if (targetTab === 'ganancias') {
      setGananciasFechaInicio(start.toISOString().split('T')[0])
      setGananciasFechaFin(end.toISOString().split('T')[0])
    } else {
      setFechaInicio(start.toISOString().split('T')[0])
      setFechaFin(end.toISOString().split('T')[0])
    }
  }

  const generarReporte = async () => {
    setLoading(true)
    setReportHtml(null)
    try {
      if (activeTab === "proveedor") {
        const html = await api.reportes.getReporteProveedor({
          fechaInicio,
          fechaFin,
          pagoPendiente,
          pagoPagado,
        })
        setReportHtml(html)
      } else if (activeTab === "ventas") {
        const html = await api.reportes.getReporteVentas({
          fechaInicio: ventasFechaInicio,
          fechaFin: ventasFechaFin,
          metodosPago,
        })
        setReportHtml(html)
      } else if (activeTab === "ganancias") {
        const html = await api.reportes.getReporteGanancias({
          fechaInicio: gananciasFechaInicio,
          fechaFin: gananciasFechaFin,
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
      const originalTitle = document.title;
      const timestamp = new Date().getTime();
      document.title = activeTab === 'proveedor' 
        ? `Reporte_Proveedores_${timestamp}` 
        : activeTab === 'ventas' ? `Reporte_Ventas_${timestamp}` : `Reporte_Ganancias_${timestamp}`;
      
      iframeRef.current.contentWindow.print();
      
      document.title = originalTitle;
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
          <TabsTrigger value="ventas">Reporte de Ventas</TabsTrigger>
          <TabsTrigger value="ganancias">Reporte de Ganancias</TabsTrigger>
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
                  <Label className="text-base font-semibold mb-3 block">Estado de Pago</Label>
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="pagoPendiente" 
                        checked={pagoPendiente} 
                        onCheckedChange={(c: boolean | "indeterminate") => setPagoPendiente(!!c)} 
                      />
                      <Label htmlFor="pagoPendiente" className="font-normal">Pendiente</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="pagoPagado" 
                        checked={pagoPagado} 
                        onCheckedChange={(c: boolean | "indeterminate") => setPagoPagado(!!c)} 
                      />
                      <Label htmlFor="pagoPagado" className="font-normal">Pagado</Label>
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

        <TabsContent value="ventas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Filtros del Reporte de Ventas</CardTitle>
              <CardDescription>Configura los parámetros para generar el reporte de ventas del negocio.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-semibold mb-3 block">Rango de Fechas</Label>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Button variant="outline" size="sm" onClick={() => handleQuickDate('semana', 'ventas')}>
                        <CalendarDays className="mr-2 h-4 w-4" />
                        Última Semana
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleQuickDate('mes', 'ventas')}>
                        <Calendar className="mr-2 h-4 w-4" />
                        Último Mes
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleQuickDate('año', 'ventas')}>
                        <CalendarRange className="mr-2 h-4 w-4" />
                        Último Año
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => {
                        setVentasFechaInicio("")
                        setVentasFechaFin("")
                      }}>
                        Limpiar Fechas
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Fecha Inicio</Label>
                        <Input 
                          type="date" 
                          value={ventasFechaInicio} 
                          onChange={(e) => setVentasFechaInicio(e.target.value)} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Fecha Fin</Label>
                        <Input 
                          type="date" 
                          value={ventasFechaFin} 
                          onChange={(e) => setVentasFechaFin(e.target.value)} 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-semibold mb-3 block">Métodos de Pago</Label>
                  <div className="flex flex-col space-y-3">
                    {['efectivo', 'tarjeta', 'transferencia', 'uberEats'].map((metodo) => (
                      <div key={metodo} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`metodo-${metodo}`}
                          checked={metodosPago.includes(metodo)} 
                          onCheckedChange={(c: boolean | "indeterminate") => {
                            if (c) {
                              setMetodosPago([...metodosPago, metodo])
                            } else {
                              setMetodosPago(metodosPago.filter(m => m !== metodo))
                            }
                          }} 
                        />
                        <Label htmlFor={`metodo-${metodo}`} className="font-normal capitalize">
                          {metodo === 'uberEats' ? 'UberEats' : metodo}
                        </Label>
                      </div>
                    ))}
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

        <TabsContent value="ganancias" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Filtros del Reporte de Ganancias</CardTitle>
              <CardDescription>Configura los parámetros para ver las ganancias de las ventas en un periodo.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-semibold mb-3 block">Rango de Fechas</Label>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Button variant="outline" size="sm" onClick={() => handleQuickDate('semana', 'ganancias')}>
                        <CalendarDays className="mr-2 h-4 w-4" />
                        Última Semana
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleQuickDate('mes', 'ganancias')}>
                        <Calendar className="mr-2 h-4 w-4" />
                        Último Mes
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleQuickDate('año', 'ganancias')}>
                        <CalendarRange className="mr-2 h-4 w-4" />
                        Último Año
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => {
                        setGananciasFechaInicio("")
                        setGananciasFechaFin("")
                      }}>
                        Limpiar Fechas
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Fecha Inicio</Label>
                        <Input 
                          type="date" 
                          value={gananciasFechaInicio} 
                          onChange={(e) => setGananciasFechaInicio(e.target.value)} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Fecha Fin</Label>
                        <Input 
                          type="date" 
                          value={gananciasFechaFin} 
                          onChange={(e) => setGananciasFechaFin(e.target.value)} 
                        />
                      </div>
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
