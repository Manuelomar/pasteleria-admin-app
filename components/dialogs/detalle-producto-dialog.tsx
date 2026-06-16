"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { TipoBadge, DisponibleBadge } from "@/components/badges"
import { currency, type Producto } from "@/lib/data"
import { cn } from "@/lib/utils"

export function DetalleProductoDialog({
  open,
  onOpenChange,
  producto,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  producto: Producto | null
}) {
  if (!producto) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Detalle del Producto</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 mt-2">
          {/* Imagen de producto */}
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg bg-muted border border-border">
            <img
              src={producto.imagen || "/placeholder.svg"}
              alt={producto.nombre}
              className={cn(
                "size-full object-cover",
                !producto.disponible && "opacity-60 grayscale"
              )}
            />
            <div className="absolute left-2 top-2 flex gap-2">
              <TipoBadge tipo={producto.tipo} />
              <DisponibleBadge disponible={producto.disponible} />
            </div>
          </div>

          {/* Información Principal */}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {producto.categoria}
            </span>
            <h2 className="text-xl font-bold text-foreground leading-tight">
              {producto.nombre}
            </h2>
          </div>

          {/* Grid de Precio e Inventario */}
          <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted/50 p-3 border border-border/50">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Precio</span>
              <span className="text-lg font-bold text-primary">
                {currency(producto.precio)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Stock actual</span>
              <span className="text-lg font-bold text-foreground">
                {producto.cantidad ?? 0} unidades
              </span>
            </div>
          </div>

          {/* Descripción */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Descripción
            </span>
            <p className="text-sm text-foreground/80 leading-relaxed bg-background p-3 rounded-lg border border-border min-h-[60px] whitespace-pre-wrap">
              {producto.descripcion || "Sin descripción disponible."}
            </p>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button className="w-full sm:w-auto" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
