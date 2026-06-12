import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function StatCard({
  title,
  value,
  icon: Icon,
  hint,
  accent = "primary",
}: {
  title: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  hint?: string
  accent?: "primary" | "orange" | "green" | "muted"
}) {
  const accents: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    orange: "bg-[#f4a261]/15 text-[#b96a2c]",
    green: "bg-[#8ab07d]/15 text-[#4f7642]",
    muted: "bg-muted text-muted-foreground",
  }
  return (
    <Card className="overflow-hidden">
      <CardContent className="flex items-center gap-4 p-5">
        <div className={cn("flex size-12 shrink-0 items-center justify-center rounded-xl", accents[accent])}>
          <Icon className="size-6" />
        </div>
        <div className="flex flex-col gap-0.5">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="font-heading text-2xl font-semibold leading-tight text-foreground">{value}</p>
          {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
        </div>
      </CardContent>
    </Card>
  )
}
