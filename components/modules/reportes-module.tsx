import { useState, useRef, useEffect } from "react"
import { api } from "@/services"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Loader } from "@/components/ui/loader"
import { Printer, Calendar, CalendarDays, CalendarRange, X, ChevronDown } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { type Usuario, type Producto } from "@/types"

export function ReportesModule() {
  const [activeTab, setActiveTab] = useState("proveedor")
  const [loading, setLoading] = useState(false)
  const [reportHtml, setReportHtml] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null)

  const [productos, setProductos] = useState<Producto[]>([])
  const [proveedores, setProveedores] = useState<Usuario[]>([])

  useEffect(() => {
    api.auth.getMe().then(setCurrentUser).catch(console.error)
    api.productos.getAll().then(setProductos).catch(console.error)
    api.usuarios.getAll().then(res => setProveedores(res.filter(u => u.rol === 'proveedor'))).catch(console.error)
  }, [])

  const isProveedor = currentUser?.rol === "proveedor"
  
  // Filtros
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  const [pagoPendiente, setPagoPendiente] = useState(false)
  const [pagoPagado, setPagoPagado] = useState(false)
  const [proveedoresIds, setProveedoresIds] = useState<string[]>([])
  const [searchProveedor, setSearchProveedor] = useState("")
  const [isProveedorDropdownOpen, setIsProveedorDropdownOpen] = useState(false)

  // Filtros Ventas
  const [ventasFechaInicio, setVentasFechaInicio] = useState("")
  const [ventasFechaFin, setVentasFechaFin] = useState("")
  const [metodosPago, setMetodosPago] = useState<string[]>([])

  // Filtros Ganancias
  const [gananciasFechaInicio, setGananciasFechaInicio] = useState("")
  const [gananciasFechaFin, setGananciasFechaFin] = useState("")
  const [gananciasProductosIds, setGananciasProductosIds] = useState<string[]>([])
  const [searchProductoGanancias, setSearchProductoGanancias] = useState("")
  const [isGananciasDropdownOpen, setIsGananciasDropdownOpen] = useState(false)

  // Filtros Costos
  const [costosFechaInicio, setCostosFechaInicio] = useState("")
  const [costosFechaFin, setCostosFechaFin] = useState("")
  const [costosProductosIds, setCostosProductosIds] = useState<string[]>([])
  const [searchProductoCostos, setSearchProductoCostos] = useState("")
  const [isCostosDropdownOpen, setIsCostosDropdownOpen] = useState(false)

  const iframeRef = useRef<HTMLIFrameElement>(null)

  const getUniqueProducts = () => {
    const unique: Producto[] = [];
    const seen = new Set<string>();
    for (const p of productos) {
      const name = p.nombre.toLowerCase().trim();
      if (!seen.has(name)) {
        seen.add(name);
        unique.push(p);
      }
    }
    return unique;
  }

  const toggleProveedorId = (id: string) => {
    if (proveedoresIds.includes(id)) {
      setProveedoresIds(proveedoresIds.filter(pid => pid !== id));
    } else {
      setProveedoresIds([...proveedoresIds, id]);
    }
  }

  const toggleProductName = (
    productName: string, 
    selectedIds: string[], 
    setSelectedIds: (ids: string[]) => void
  ) => {
    const normalizedName = productName.toLowerCase().trim();
    const matchingIds = productos
      .filter(p => p.nombre.toLowerCase().trim() === normalizedName)
      .map(p => p.id);
    
    // Si todos los matchingIds están en selectedIds, significa que está "seleccionado" y debemos quitarlos.
    const isSelected = matchingIds.every(id => selectedIds.includes(id));
    
    if (isSelected) {
      setSelectedIds(selectedIds.filter(id => !matchingIds.includes(id)));
    } else {
      const newIds = new Set(selectedIds);
      matchingIds.forEach(id => newIds.add(id));
      setSelectedIds(Array.from(newIds));
    }
  }

  const getProductName = (p: Producto | undefined | null) => {
    if (!p) return "";
    return p.nombre;
  }

  const handleQuickDate = (type: 'semana' | 'mes' | 'año', targetTab: 'proveedor' | 'ventas' | 'ganancias' | 'costos' = 'proveedor') => {
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
    } else if (targetTab === 'costos') {
      setCostosFechaInicio(start.toISOString().split('T')[0])
      setCostosFechaFin(end.toISOString().split('T')[0])
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
          proveedorId: !isProveedor && proveedoresIds.length > 0 ? proveedoresIds.join(',') : undefined,
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
          productoId: gananciasProductosIds.length > 0 ? gananciasProductosIds.join(",") : undefined,
        })
        setReportHtml(html)
      } else if (activeTab === "costos") {
        const html = await api.reportes.getReporteCostos({
          fechaInicio: costosFechaInicio,
          fechaFin: costosFechaFin,
          productoId: costosProductosIds.length > 0 ? costosProductosIds.join(",") : undefined,
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
        : activeTab === 'ventas' ? `Reporte_Ventas_${timestamp}` 
        : activeTab === 'ganancias' ? `Reporte_Ganancias_${timestamp}`
        : `Reporte_Costos_${timestamp}`;
      
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
          {!isProveedor && (
            <>
              <TabsTrigger value="ventas">Reporte de Ventas</TabsTrigger>
              <TabsTrigger value="ganancias">Reporte de Ganancias</TabsTrigger>
              <TabsTrigger value="costos">Reporte de Costos</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="proveedor" className="space-y-4">
          <Card className="overflow-visible">
            <CardHeader>
              <CardTitle>Filtros del Reporte</CardTitle>
              <CardDescription>Configura los parámetros para generar el reporte de entregas de proveedores.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-semibold mb-3 block">Rango de Fechas</Label>
                    
                    <div className="flex flex-col sm:flex-row flex-wrap gap-2 mb-4">
                      <Button variant="outline" size="sm" onClick={() => handleQuickDate('semana')} className="w-full sm:w-auto">
                        <CalendarDays className="mr-2 h-4 w-4" />
                        Última Semana
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleQuickDate('mes')} className="w-full sm:w-auto">
                        <Calendar className="mr-2 h-4 w-4" />
                        Último Mes
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleQuickDate('año')} className="w-full sm:w-auto">
                        <CalendarRange className="mr-2 h-4 w-4" />
                        Último Año
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => {
                        setFechaInicio("")
                        setFechaFin("")
                        setProveedoresIds([])
                      }} className="w-full sm:w-auto">
                        Limpiar Filtros
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
                  
                  {!isProveedor && (
                    <div className="mt-4 space-y-4">
                      <Label className="text-base font-semibold mb-3 block">Filtrar por Proveedor(es)</Label>
                      <div className="relative">
                        <div 
                          className="flex w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm cursor-pointer hover:bg-accent/50"
                          onClick={() => setIsProveedorDropdownOpen(!isProveedorDropdownOpen)}
                        >
                          <span className="truncate">
                            {proveedoresIds.length === 0 
                              ? "Todos los proveedores" 
                              : `${proveedoresIds.length} proveedor(es) seleccionado(s)`}
                          </span>
                          <ChevronDown className="h-4 w-4 opacity-50" />
                        </div>

                        {isProveedorDropdownOpen && (
                          <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md p-1">
                            <div className="p-1 pb-2 border-b">
                              <Input
                                placeholder="Buscar proveedor..."
                                value={searchProveedor}
                                onChange={(e) => setSearchProveedor(e.target.value)}
                                className="h-8"
                                autoFocus
                              />
                            </div>
                            <div className="max-h-60 overflow-y-auto p-1">
                              <div 
                                className="flex items-center space-x-2 rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
                                onClick={() => {
                                  setProveedoresIds([]);
                                  setIsProveedorDropdownOpen(false);
                                }}
                              >
                                Todos los proveedores (Limpiar)
                              </div>
                              {proveedores
                                .filter(p => (p.nombre || 'Sin nombre').toLowerCase().includes(searchProveedor.toLowerCase()))
                                .map(p => {
                                  const isSelected = proveedoresIds.includes(p.id);
                                  
                                  return (
                                    <div 
                                      key={p.id} 
                                      className="flex items-center space-x-2 rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
                                      onClick={() => toggleProveedorId(p.id)}
                                    >
                                      <Checkbox 
                                        checked={isSelected} 
                                        onCheckedChange={() => {}} 
                                        className="pointer-events-none"
                                      />
                                      <span>{p.nombre || 'Sin nombre'}</span>
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {proveedoresIds.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {proveedoresIds.map(id => {
                            const p = proveedores.find(prov => prov.id === id);
                            const nombre = p?.nombre || 'Sin nombre';
                            return (
                              <Badge key={id} variant="secondary" className="flex items-center gap-1.5 py-1 px-3 text-sm">
                                {nombre}
                                <button 
                                  onClick={() => toggleProveedorId(id)}
                                  className="ml-1 rounded-full p-0.5 hover:bg-muted text-muted-foreground hover:text-foreground"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </Badge>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
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
                    
                    <div className="flex flex-col sm:flex-row flex-wrap gap-2 mb-4">
                      <Button variant="outline" size="sm" onClick={() => handleQuickDate('semana', 'ventas')} className="w-full sm:w-auto">
                        <CalendarDays className="mr-2 h-4 w-4" />
                        Última Semana
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleQuickDate('mes', 'ventas')} className="w-full sm:w-auto">
                        <Calendar className="mr-2 h-4 w-4" />
                        Último Mes
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleQuickDate('año', 'ventas')} className="w-full sm:w-auto">
                        <CalendarRange className="mr-2 h-4 w-4" />
                        Último Año
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => {
                        setVentasFechaInicio("")
                        setVentasFechaFin("")
                      }} className="w-full sm:w-auto">
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
          <Card className="overflow-visible">
            <CardHeader>
              <CardTitle>Filtros del Reporte de Ganancias</CardTitle>
              <CardDescription>Configura los parámetros para ver las ganancias de las ventas en un periodo.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-semibold mb-3 block">Rango de Fechas</Label>
                    
                    <div className="flex flex-col sm:flex-row flex-wrap gap-2 mb-4">
                      <Button variant="outline" size="sm" onClick={() => handleQuickDate('semana', 'ganancias')} className="w-full sm:w-auto">
                        <CalendarDays className="mr-2 h-4 w-4" />
                        Última Semana
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleQuickDate('mes', 'ganancias')} className="w-full sm:w-auto">
                        <Calendar className="mr-2 h-4 w-4" />
                        Último Mes
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleQuickDate('año', 'ganancias')} className="w-full sm:w-auto">
                        <CalendarRange className="mr-2 h-4 w-4" />
                        Último Año
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => {
                        setGananciasFechaInicio("")
                        setGananciasFechaFin("")
                        setGananciasProductosIds([])
                      }} className="w-full sm:w-auto">
                        Limpiar Filtros
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

                <div className="space-y-4">
                  <Label className="text-base font-semibold mb-3 block">Filtrar por Producto(s)</Label>
                  <div className="relative">
                    <div 
                      className="flex w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm cursor-pointer hover:bg-accent/50"
                      onClick={() => setIsGananciasDropdownOpen(!isGananciasDropdownOpen)}
                    >
                      <span className="truncate">
                        {gananciasProductosIds.length === 0 
                          ? "Agregar producto al filtro..." 
                          : `${gananciasProductosIds.length} producto(s) seleccionado(s)`}
                      </span>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </div>

                    {isGananciasDropdownOpen && (
                      <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md p-1">
                        <div className="p-1 pb-2 border-b">
                          <Input
                            placeholder="Buscar producto..."
                            value={searchProductoGanancias}
                            onChange={(e) => setSearchProductoGanancias(e.target.value)}
                            className="h-8"
                            autoFocus
                          />
                        </div>
                        <div className="max-h-60 overflow-y-auto p-1">
                          <div 
                            className="flex items-center space-x-2 rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
                            onClick={() => {
                              setGananciasProductosIds([]);
                              setIsGananciasDropdownOpen(false);
                            }}
                          >
                            Todos los productos (Limpiar)
                          </div>
                          {getUniqueProducts()
                            .filter(p => p.nombre.toLowerCase().includes(searchProductoGanancias.toLowerCase()))
                            .map(p => {
                              const matchingIds = productos
                                .filter(prod => prod.nombre.toLowerCase().trim() === p.nombre.toLowerCase().trim())
                                .map(prod => prod.id);
                              const isSelected = matchingIds.every(id => gananciasProductosIds.includes(id)) && matchingIds.length > 0;
                              
                              return (
                                <div 
                                  key={p.nombre} 
                                  className="flex items-center space-x-2 rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
                                  onClick={() => toggleProductName(p.nombre, gananciasProductosIds, setGananciasProductosIds)}
                                >
                                  <Checkbox 
                                    checked={isSelected} 
                                    onCheckedChange={() => {}} 
                                    className="pointer-events-none"
                                  />
                                  <span>{p.nombre}</span>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {gananciasProductosIds.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {Array.from(new Set(gananciasProductosIds.map(id => productos.find(p => p.id === id)?.nombre).filter(Boolean))).map(nombre => (
                          <Badge key={nombre} variant="secondary" className="flex items-center gap-1.5 py-1 px-3 text-sm">
                            {nombre}
                            <button 
                              onClick={() => toggleProductName(nombre as string, gananciasProductosIds, setGananciasProductosIds)}
                              className="ml-1 rounded-full p-0.5 hover:bg-muted text-muted-foreground hover:text-foreground"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </Badge>
                      ))}
                    </div>
                  )}
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

        <TabsContent value="costos" className="space-y-4">
          <Card className="overflow-visible">
            <CardHeader>
              <CardTitle>Filtros del Reporte de Costos</CardTitle>
              <CardDescription>Configura los parámetros para ver los costos de las ventas en un periodo.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-semibold mb-3 block">Rango de Fechas</Label>
                    
                    <div className="flex flex-col sm:flex-row flex-wrap gap-2 mb-4">
                      <Button variant="outline" size="sm" onClick={() => handleQuickDate('semana', 'costos')} className="w-full sm:w-auto">
                        <CalendarDays className="mr-2 h-4 w-4" />
                        Última Semana
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleQuickDate('mes', 'costos')} className="w-full sm:w-auto">
                        <Calendar className="mr-2 h-4 w-4" />
                        Último Mes
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleQuickDate('año', 'costos')} className="w-full sm:w-auto">
                        <CalendarRange className="mr-2 h-4 w-4" />
                        Último Año
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => {
                        setCostosFechaInicio("")
                        setCostosFechaFin("")
                        setCostosProductosIds([])
                      }} className="w-full sm:w-auto">
                        Limpiar Filtros
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Fecha Inicio</Label>
                        <Input 
                          type="date" 
                          value={costosFechaInicio} 
                          onChange={(e) => setCostosFechaInicio(e.target.value)} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Fecha Fin</Label>
                        <Input 
                          type="date" 
                          value={costosFechaFin} 
                          onChange={(e) => setCostosFechaFin(e.target.value)} 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-semibold mb-3 block">Filtrar por Producto(s)</Label>
                  <div className="relative">
                    <div 
                      className="flex w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm cursor-pointer hover:bg-accent/50"
                      onClick={() => setIsCostosDropdownOpen(!isCostosDropdownOpen)}
                    >
                      <span className="truncate">
                        {costosProductosIds.length === 0 
                          ? "Agregar producto al filtro..." 
                          : `${costosProductosIds.length} producto(s) seleccionado(s)`}
                      </span>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </div>

                    {isCostosDropdownOpen && (
                      <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md p-1">
                        <div className="p-1 pb-2 border-b">
                          <Input
                            placeholder="Buscar producto..."
                            value={searchProductoCostos}
                            onChange={(e) => setSearchProductoCostos(e.target.value)}
                            className="h-8"
                            autoFocus
                          />
                        </div>
                        <div className="max-h-60 overflow-y-auto p-1">
                          <div 
                            className="flex items-center space-x-2 rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
                            onClick={() => {
                              setCostosProductosIds([]);
                              setIsCostosDropdownOpen(false);
                            }}
                          >
                            Todos los productos (Limpiar)
                          </div>
                          {getUniqueProducts()
                            .filter(p => p.nombre.toLowerCase().includes(searchProductoCostos.toLowerCase()))
                            .map(p => {
                              const matchingIds = productos
                                .filter(prod => prod.nombre.toLowerCase().trim() === p.nombre.toLowerCase().trim())
                                .map(prod => prod.id);
                              const isSelected = matchingIds.every(id => costosProductosIds.includes(id)) && matchingIds.length > 0;
                              
                              return (
                                <div 
                                  key={p.nombre} 
                                  className="flex items-center space-x-2 rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
                                  onClick={() => toggleProductName(p.nombre, costosProductosIds, setCostosProductosIds)}
                                >
                                  <Checkbox 
                                    checked={isSelected} 
                                    onCheckedChange={() => {}} 
                                    className="pointer-events-none"
                                  />
                                  <span>{p.nombre}</span>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {costosProductosIds.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {Array.from(new Set(costosProductosIds.map(id => productos.find(p => p.id === id)?.nombre).filter(Boolean))).map(nombre => (
                          <Badge key={nombre} variant="secondary" className="flex items-center gap-1.5 py-1 px-3 text-sm">
                            {nombre}
                            <button 
                              onClick={() => toggleProductName(nombre as string, costosProductosIds, setCostosProductosIds)}
                              className="ml-1 rounded-full p-0.5 hover:bg-muted text-muted-foreground hover:text-foreground"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </Badge>
                      ))}
                    </div>
                  )}
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
