import { type Producto, currency } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TipoBadge } from '@/components/badges'
import { API_URL } from '@/services/api.config'
import { type CartItem } from './ComboBuilder'
import { Plus, Minus } from 'lucide-react'

interface ComboProductGridProps {
  productos: Producto[]
  cart: Record<string, CartItem>
  onUpdateQuantity: (producto: Producto, delta: number) => void
}

export function ComboProductGrid({ productos, cart, onUpdateQuantity }: ComboProductGridProps) {
  if (productos.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
        No hay productos disponibles.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
      {productos.map((p) => {
        const cartItem = cart[p.id]
        const quantity = cartItem ? cartItem.cantidad : 0

        return (
          <Card key={p.id} className="flex h-full flex-col overflow-hidden border-border/50 shadow-sm transition-all hover:shadow-md">
            <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-muted">
              <img
                src={(p.imagen && p.imagen.trim() !== '' && p.imagen !== 'null' && p.imagen !== 'undefined') 
                  ? (p.imagen.startsWith('data:') ? p.imagen : API_URL.replace('/api', '') + p.imagen) 
                  : "/placeholder.svg"}
                alt={p.nombre}
                className={`absolute inset-0 h-full w-full object-cover transition-transform duration-300 hover:scale-105`}
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg"
                }}
              />
              <div className="absolute right-2 top-2 z-10 flex flex-col gap-1">
                <TipoBadge tipo={p.tipo} />
              </div>
            </div>
            
            <CardContent className="flex flex-grow flex-col p-4">
              <h3 className="min-h-[2.5rem] font-medium leading-tight line-clamp-2">{p.nombre}</h3>
              
              <div className="mt-auto pt-3 flex flex-col gap-4">
                <div className="font-heading text-lg font-bold text-primary">
                  {currency(p.precio)}
                </div>
                
                <div className="flex items-center justify-between gap-3 rounded-md border p-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                    onClick={() => onUpdateQuantity(p, -1)}
                    disabled={quantity === 0}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-medium">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                    onClick={() => onUpdateQuantity(p, 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
