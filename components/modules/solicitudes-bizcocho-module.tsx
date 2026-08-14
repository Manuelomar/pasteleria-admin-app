import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Search, FileText, Phone, Cake, Eye, Trash2, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { api } from '@/services'
import { API_URL } from '@/services/api.config'
import { toast } from 'sonner'
import type { Solicitud, EstadoSolicitud } from '@/types/solicitud'
import { formatCakePrice } from '../cake-builder/utils/calculate-cake-price'
import {
  SIZE_OPTIONS,
  FILLING_OPTIONS,
  COLOR_OPTIONS,
  COLOR_COUNT_OPTIONS,
  EXTRA_FROSTING_OPTIONS,
  TOPPER_OPTIONS,
} from '../cake-builder/constants/cake-options'
import { AppPagination } from '@/components/ui/app-pagination'
import debounce from 'lodash/debounce'

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

export function SolicitudesBizcochoModule() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedSolicitud, setSelectedSolicitud] = useState<Solicitud | null>(null)

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  const fetchSolicitudes = async (page: number, limit: number) => {
    setLoading(true)
    try {
      const data = await api.solicitudes.getPaged(page, limit, 'bizcocho')
      setSolicitudes(data.data)
      setTotalPages(data.totalPages)
      setTotalItems(data.total)
    } catch (error) {
      toast.error('Error al cargar solicitudes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSolicitudes(currentPage, pageSize)
  }, [currentPage, pageSize])

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('¿Estás seguro de eliminar esta solicitud?')) return
    try {
      await api.solicitudes.delete(id)
      fetchSolicitudes(currentPage, pageSize)
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

  const getConfigLabel = (config: Record<string, any> | null) => {
    if (!config) return 'Sin configuración'
    const size = SIZE_OPTIONS.find(o => o.value === config.size)?.label || config.size
    const filling = FILLING_OPTIONS.find(o => o.value === config.filling)?.label || config.filling
    return `${size} - ${filling}`
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold">Solicitudes de Bizcochos</h2>
          <p className="text-muted-foreground">Gestiona las solicitudes de bizcochos personalizados.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Listado de solicitudes</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o teléfono en la página actual..."
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
                  <TableHead>Bizcocho</TableHead>
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
                      No hay solicitudes registradas en esta página.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((sol) => (
                    <TableRow key={sol.id} className="cursor-pointer" onClick={() => setSelectedSolicitud(sol)}>
                      <TableCell className="whitespace-nowrap">
                        {new Date(sol.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-medium">
                        {sol.nombre} {sol.apellido}
                      </TableCell>
                      <TableCell>{sol.telefono}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {getConfigLabel(sol.configuracion)}
                      </TableCell>
                      <TableCell>
                        {sol.precioEstimado ? formatCakePrice(sol.precioEstimado) : '—'}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${estadoColor[sol.estado]}`}>
                          {estadoLabel[sol.estado]}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleDelete(sol.id, e)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="mt-4">
            <AppPagination
              currentPage={currentPage}
              pageSize={pageSize}
              totalItems={totalItems}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size)
                setCurrentPage(1)
              }}
              itemName="solicitudes"
            />
          </div>
        </CardContent>
      </Card>

      {/* Modal de Detalle */}
      {selectedSolicitud && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl bg-card p-6 shadow-2xl">
            <button
              onClick={() => setSelectedSolicitud(null)}
              className="absolute right-4 top-4 rounded-full p-2 hover:bg-muted"
            >
              <XCircle className="h-5 w-5 text-muted-foreground" />
            </button>
            
            <h2 className="mb-4 text-xl font-bold">Detalle de Solicitud</h2>
            
            <div className="grid gap-6 md:grid-cols-2">
              {/* Columna Izquierda: Datos del cliente y estado */}
              <div className="space-y-6">
                <Card className="shadow-none border-border/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                      <FileText className="h-4 w-4" /> Datos de Contacto
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p><strong>Cliente:</strong> {selectedSolicitud.nombre} {selectedSolicitud.apellido}</p>
                    <p><strong>Teléfono:</strong> {selectedSolicitud.telefono}</p>
                    <p><strong>Correo:</strong> {selectedSolicitud.correo || 'No proporcionado'}</p>
                    <p><strong>Fecha:</strong> {new Date(selectedSolicitud.createdAt).toLocaleString()}</p>
                  </CardContent>
                </Card>

                <Card className="shadow-none border-border/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Estado de la Solicitud</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {(Object.keys(estadoLabel) as EstadoSolicitud[]).map(estado => (
                        <Button
                          key={estado}
                          size="sm"
                          variant={selectedSolicitud.estado === estado ? "default" : "outline"}
                          className={selectedSolicitud.estado === estado ? estadoColor[estado] : ''}
                          onClick={() => handleUpdateEstado(selectedSolicitud.id, estado)}
                        >
                          {estadoLabel[estado]}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Columna Derecha: Configuración y Referencia */}
              <div className="space-y-6">
                <Card className="shadow-none border-border/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                      <Cake className="h-4 w-4" /> Configuración del Bizcocho
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedSolicitud.configuracion ? (
                      <div className="space-y-1 text-sm">
                        {Object.entries(selectedSolicitud.configuracion).map(([key, value]) => {
                          // Map keys to Spanish
                          const keyMap: Record<string, string> = {
                            size: 'Tamaño',
                            filling: 'Relleno',
                            primaryColor: 'Color principal',
                            colorCount: 'Cantidad de colores',
                            extraFrosting: 'Cobertura adicional',
                            topper: 'Topper'
                          }
                          const translatedKey = keyMap[key] || key

                          // Map values to Spanish labels
                          let translatedValue = String(value)
                          if (key === 'size') translatedValue = SIZE_OPTIONS.find(o => o.value === value)?.label || translatedValue
                          if (key === 'filling') translatedValue = FILLING_OPTIONS.find(o => o.value === value)?.label || translatedValue
                          if (key === 'primaryColor') translatedValue = COLOR_OPTIONS.find(o => o.value === value)?.label || translatedValue
                          if (key === 'colorCount') translatedValue = COLOR_COUNT_OPTIONS.find(o => o.value === value)?.label || translatedValue
                          if (key === 'extraFrosting') translatedValue = EXTRA_FROSTING_OPTIONS.find(o => o.value === value)?.label || translatedValue
                          if (key === 'topper') translatedValue = TOPPER_OPTIONS.find(o => o.value === value)?.label || translatedValue

                          return (
                            <div key={key} className="flex justify-between border-b border-border/50 py-1.5 last:border-0">
                              <span className="text-muted-foreground">{translatedKey}</span>
                              <span className="font-medium">{translatedValue}</span>
                            </div>
                          )
                        })}
                        <div className="flex justify-between pt-3 font-bold mt-2 border-t border-border">
                          <span>Precio Estimado</span>
                          <span className="text-primary">{selectedSolicitud.precioEstimado ? formatCakePrice(selectedSolicitud.precioEstimado) : '—'}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Sin configuración detallada</p>
                    )}
                  </CardContent>
                </Card>

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
      )}
    </div>
  )
}
