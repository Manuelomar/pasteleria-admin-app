import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Swal from 'sweetalert2'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Search, Package, Phone, Eye, Trash2, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { api } from '@/services'
import { API_URL } from '@/services/api.config'
import { toast } from 'sonner'
import type { Solicitud, EstadoSolicitud } from '@/types/solicitud'
import { currency } from '@/types'

// Helper para color de estado
const estadoColor: Record<EstadoSolicitud, string> = {
  'pendiente': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  'en-proceso': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  'completada': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  'cancelada': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
}

const estadoLabel: Record<EstadoSolicitud, string> = {
  'pendiente': 'Pendiente',
  'en-proceso': 'En proceso',
  'completada': 'Completada',
  'cancelada': 'Cancelada',
}

export function SolicitudesComboModule() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedSolicitud, setSelectedSolicitud] = useState<Solicitud | null>(null)
  const router = useRouter()

  const fetchSolicitudes = async () => {
    try {
      const data = await api.solicitudes.getAll('combo')
      setSolicitudes(data)
    } catch (error) {
      toast.error('Error al cargar solicitudes de combos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSolicitudes()
  }, [])

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('¿Estás seguro de eliminar esta solicitud de combo?')) return
    try {
      await api.solicitudes.delete(id)
      setSolicitudes(solicitudes.filter(s => s.id !== id))
      if (selectedSolicitud?.id === id) setSelectedSolicitud(null)
      toast.success('Solicitud eliminada')
    } catch (error) {
      toast.error('Error al eliminar')
    }
  }

  const handleUpdateEstado = async (id: string, nuevoEstado: EstadoSolicitud) => {
    try {
      const updated = await api.solicitudes.updateEstado(id, nuevoEstado)
      setSolicitudes(solicitudes.map(s => s.id === id ? updated : s))
      if (selectedSolicitud?.id === id) setSelectedSolicitud(updated)
      toast.success('Estado actualizado')
    } catch (error) {
      toast.error('Error al actualizar estado')
    }
  }

  const filtered = solicitudes.filter(s =>
    s.nombre.toLowerCase().includes(search.toLowerCase()) ||
    s.apellido.toLowerCase().includes(search.toLowerCase()) ||
    s.telefono.includes(search)
  )

  const handleGenerarVenta = async () => {
    if (!selectedSolicitud) return;

    if (selectedSolicitud.configuracion?.ventaGenerada) {
      const confirmTwice = await Swal.fire({
        title: '¿Volver a vender?',
        text: 'Ya se ha generado una venta de este combo anteriormente. ¿Estás seguro de que deseas volver a venderlo?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, vender de nuevo',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#e11d48'
      })
      if (!confirmTwice.isConfirmed) return;
    }

    const { value: metodoPago } = await Swal.fire({
      title: 'Generar Venta',
      text: 'Selecciona el método de pago',
      input: 'select',
      inputOptions: {
        'efectivo': 'Efectivo',
        'tarjeta': 'Tarjeta',
        'transferencia': 'Transferencia'
      },
      inputPlaceholder: 'Selecciona un método',
      showCancelButton: true,
      confirmButtonText: 'Crear Venta',
      cancelButtonText: 'Cancelar'
    })

    if (metodoPago) {
      const items = selectedSolicitud.configuracion?.productos?.map((p: any) => ({
        productoId: p.id,
        nombre: p.nombre,
        precio: p.precioUnitario,
        cantidad: p.cantidad
      })) || []

      try {
        await api.ventas.create({
          clienteNombre: `${selectedSolicitud.nombre} ${selectedSolicitud.apellido}`,
          clienteId: null,
          items,
          subtotal: selectedSolicitud.configuracion?.subtotal || 0,
          descuento: selectedSolicitud.configuracion?.descuentoAplicado || 0,
          impuesto: 0,
          total: selectedSolicitud.precioEstimado || 0,
          metodoPago,
          estadoPago: 'pagado',
          montoPagado: selectedSolicitud.precioEstimado || 0,
          fecha: new Date().toISOString()
        })
        
        // Update the solicitud configuration to mark it as sold
        const updatedConfig = { ...selectedSolicitud.configuracion, ventaGenerada: true };
        const updatedSolicitud = await api.solicitudes.updateConfiguracion(selectedSolicitud.id, updatedConfig);
        setSelectedSolicitud(updatedSolicitud);
        fetchSolicitudes();

        toast.success('Venta generada exitosamente')
        
        const { isConfirmed } = await Swal.fire({
          title: 'Venta Generada',
          text: '¿Deseas ir al módulo de Ventas o seguir aquí?',
          icon: 'success',
          showCancelButton: true,
          confirmButtonText: 'Ir a Ventas',
          cancelButtonText: 'Seguir aquí'
        })
        if (isConfirmed) {
           router.push('/ventas')
        }
      } catch (err) {
        toast.error('Error al generar la venta')
      }
    }
  }

  const getConfigLabel = (config: Record<string, any> | null) => {
    if (!config || !config.productos || !Array.isArray(config.productos)) return 'Sin productos'
    const limit = 2
    const firstProducts = config.productos.slice(0, limit).map((p: any) => p.nombre).join(', ')
    return config.productos.length > limit 
      ? `${firstProducts} +${config.productos.length - limit} más...`
      : firstProducts
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold">Solicitudes de Combos</h2>
          <p className="text-muted-foreground">Gestiona las solicitudes de combos de productos.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Listado de solicitudes</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o teléfono..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Combo</TableHead>
                  <TableHead>Precio Est.</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      No hay solicitudes registradas.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((sol) => (
                    <TableRow key={sol.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedSolicitud(sol)}>
                      <TableCell className="whitespace-nowrap">
                        {new Date(sol.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-medium">
                        {sol.nombre} {sol.apellido}
                      </TableCell>
                      <TableCell>
                        <a href={`tel:${sol.telefono}`} className="text-blue-600 hover:underline" onClick={(e) => e.stopPropagation()}>
                          {sol.telefono}
                        </a>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-muted-foreground">
                        {getConfigLabel(sol.configuracion)}
                      </TableCell>
                      <TableCell className="font-bold">
                        {sol.precioEstimado ? currency(sol.precioEstimado) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${estadoColor[sol.estado]} border-transparent`} variant="outline">
                          {estadoLabel[sol.estado]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setSelectedSolicitud(sol) }}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={(e) => handleDelete(sol.id, e)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Detalle */}
      {selectedSolicitud && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setSelectedSolicitud(null)} />
          <div className="relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-2xl">
            <div className="flex items-center justify-between border-b px-6 py-4 bg-muted/20">
              <div>
                <h2 className="font-heading text-xl font-bold">Detalle de Solicitud</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedSolicitud(null)} className="rounded-full">
                <XCircle className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Columna Izquierda */}
                <div className="space-y-6">
                  {/* Datos del Cliente */}
                  <Card className="shadow-none border-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Datos de Contacto
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="grid grid-cols-[100px_1fr]">
                        <span className="font-medium">Cliente:</span>
                        <span>{selectedSolicitud.nombre} {selectedSolicitud.apellido}</span>
                      </div>
                      <div className="grid grid-cols-[100px_1fr]">
                        <span className="font-medium">Teléfono:</span>
                        <a href={`https://wa.me/${selectedSolicitud.telefono.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                          {selectedSolicitud.telefono}
                        </a>
                      </div>
                      {selectedSolicitud.correo && (
                        <div className="grid grid-cols-[100px_1fr]">
                          <span className="font-medium">Correo:</span>
                          <span>{selectedSolicitud.correo}</span>
                        </div>
                      )}
                      <div className="grid grid-cols-[100px_1fr]">
                        <span className="font-medium">Fecha:</span>
                        <span>{new Date(selectedSolicitud.createdAt).toLocaleString()}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Acciones de Estado */}
                  <Card className="shadow-none border-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-muted-foreground">Estado de la Solicitud</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          variant={selectedSolicitud.estado === 'pendiente' ? 'default' : 'outline'}
                          size="sm"
                          className={selectedSolicitud.estado === 'pendiente' ? 'bg-amber-600 hover:bg-amber-700' : ''}
                          onClick={() => handleUpdateEstado(selectedSolicitud.id, 'pendiente')}
                        >
                          <Clock className="mr-2 h-3 w-3" />
                          Pendiente
                        </Button>
                        <Button 
                          variant={selectedSolicitud.estado === 'en-proceso' ? 'default' : 'outline'}
                          size="sm"
                          className={selectedSolicitud.estado === 'en-proceso' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                          onClick={() => handleUpdateEstado(selectedSolicitud.id, 'en-proceso')}
                        >
                          <Package className="mr-2 h-3 w-3" />
                          En proceso
                        </Button>
                        <Button 
                          variant={selectedSolicitud.estado === 'completada' ? 'default' : 'outline'}
                          size="sm"
                          className={selectedSolicitud.estado === 'completada' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                          onClick={() => handleUpdateEstado(selectedSolicitud.id, 'completada')}
                        >
                          <CheckCircle2 className="mr-2 h-3 w-3" />
                          Completada
                        </Button>
                        <Button 
                          variant={selectedSolicitud.estado === 'cancelada' ? 'default' : 'outline'}
                          size="sm"
                          className={selectedSolicitud.estado === 'cancelada' ? 'bg-red-600 hover:bg-red-700' : ''}
                          onClick={() => handleUpdateEstado(selectedSolicitud.id, 'cancelada')}
                        >
                          <XCircle className="mr-2 h-3 w-3" />
                          Cancelada
                        </Button>
                      </div>

                      {selectedSolicitud.estado === 'completada' && (
                        <div className="mt-6 border-t pt-4">
                          <Button 
                            className={`w-full ${selectedSolicitud.configuracion?.ventaGenerada ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'}`} 
                            onClick={handleGenerarVenta}
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            {selectedSolicitud.configuracion?.ventaGenerada ? 'Volver a vender este combo' : 'Generar Venta'}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Columna Derecha */}
                <div className="space-y-6">
                  {/* Configuración del Combo */}
                  <Card className="shadow-none border-border/50">
                    <CardHeader className="pb-2 border-b">
                      <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Productos del Combo
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 text-sm">
                      {selectedSolicitud.configuracion?.productos && Array.isArray(selectedSolicitud.configuracion.productos) ? (
                        <div className="space-y-4">
                          <div className="flex flex-col gap-2">
                            {selectedSolicitud.configuracion.productos.map((prod: any) => (
                              <div key={prod.id} className="flex justify-between items-center pb-2 border-b border-border/40 last:border-0">
                                <div>
                                  <div className="font-medium">{prod.nombre}</div>
                                  <div className="text-muted-foreground text-xs">{prod.cantidad} x {currency(prod.precioUnitario)}</div>
                                </div>
                                <div className="font-medium">{currency(prod.cantidad * prod.precioUnitario)}</div>
                              </div>
                            ))}
                          </div>
                          
                          <div className="border-t pt-4 space-y-1">
                            <div className="flex justify-between text-muted-foreground">
                              <span>Subtotal</span>
                              <span>{currency(selectedSolicitud.configuracion.subtotal || 0)}</span>
                            </div>
                            {selectedSolicitud.configuracion.descuentoAplicado > 0 && (
                              <div className="flex justify-between text-green-600">
                                <span>Descuento Aplicado</span>
                                <span>- {currency(selectedSolicitud.configuracion.descuentoAplicado)}</span>
                              </div>
                            )}
                            <div className="flex justify-between font-bold pt-2 text-base">
                              <span>Total</span>
                              <span className="text-primary">{currency(selectedSolicitud.precioEstimado || 0)}</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No hay detalles de configuración disponibles.</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Imagen de Referencia */}
                  {selectedSolicitud.imagenReferencia && (
                    <Card className="shadow-none border-border/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">Imagen de Referencia</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <a 
                          href={`${API_URL.replace('/api', '')}${selectedSolicitud.imagenReferencia}`} 
                          target="_blank" 
                          rel="noreferrer"
                        >
                          <img
                            src={`${API_URL.replace('/api', '')}${selectedSolicitud.imagenReferencia}`}
                            alt="Referencia"
                            className="w-full rounded-md border border-border object-contain max-h-48 cursor-pointer hover:opacity-90 transition-opacity"
                          />
                        </a>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
