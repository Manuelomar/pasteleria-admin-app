import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Tipo, EstadoPago } from "@/types"
import { tipoLabel } from "@/types"

export function TipoBadge({ tipo }: { tipo: Tipo }) {
  const styles: Record<Tipo, string> = {
    dulce: "border-transparent bg-primary/10 text-primary",
    salado: "border-transparent bg-[#f4a261]/15 text-[#b96a2c]",
    bebida: "border-transparent bg-[#8ab07d]/15 text-[#4f7642]",
  }
  return (
    <Badge variant="outline" className={cn("font-medium", styles[tipo])}>
      {tipoLabel[tipo]}
    </Badge>
  )
}

export function EstadoPagoBadge({ estado }: { estado: EstadoPago }) {
  const config: Record<EstadoPago, { label: string; className: string }> = {
    pagado: { label: "Pagado", className: "border-transparent bg-[#8ab07d]/15 text-[#4f7642]" },
    pendiente: { label: "Pendiente", className: "border-transparent bg-primary/10 text-primary" },
    parcial: { label: "Parcial", className: "border-transparent bg-[#f4a261]/15 text-[#b96a2c]" },
  }
  const c = config[estado]
  return (
    <Badge variant="outline" className={cn("font-medium", c.className)}>
      {c.label}
    </Badge>
  )
}

export function ActivoBadge({ activo }: { activo: boolean }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium",
        activo
          ? "border-transparent bg-[#8ab07d]/15 text-[#4f7642]"
          : "border-transparent bg-muted text-muted-foreground",
      )}
    >
      {activo ? "Activo" : "Inactivo"}
    </Badge>
  )
}

export function DisponibleBadge({ disponible }: { disponible: boolean }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium",
        disponible
          ? "border-transparent bg-[#8ab07d]/15 text-[#4f7642]"
          : "border-transparent bg-muted text-muted-foreground",
      )}
    >
      {disponible ? "Disponible" : "No disponible"}
    </Badge>
  )
}
