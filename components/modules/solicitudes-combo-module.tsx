import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package } from 'lucide-react'

export function SolicitudesComboModule() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold">Solicitudes de Combos</h2>
          <p className="text-muted-foreground">Gestiona las solicitudes de combos para fiestas.</p>
        </div>
      </div>

      <Card className="flex min-h-[400px] flex-col items-center justify-center border-dashed text-center">
        <CardContent className="flex flex-col items-center gap-4 pt-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Package className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-1">
            <h3 className="font-heading text-xl font-bold">Próximamente</h3>
            <p className="max-w-sm text-sm text-muted-foreground">
              El módulo de solicitudes de combos está en desarrollo y estará disponible pronto.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
