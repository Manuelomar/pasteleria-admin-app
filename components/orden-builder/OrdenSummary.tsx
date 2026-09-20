import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { currency } from '@/types'
import { ShoppingBag, Trash2, CheckCircle2 } from 'lucide-react'
import { type CartItem } from './OrdenBuilder'
import { OrdenConfirmModal } from './OrdenConfirmModal'
import { api } from '@/services'
import { toast } from 'sonner'
import { AnimatePresence } from 'motion/react'

interface OrdenSummaryProps {
  cart: Record<string, CartItem>
  onClearCart: () => void
}

export function OrdenSummary({ cart, onClearCart }: OrdenSummaryProps) {
  const [isConfirming, setIsConfirming] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const cartItems = Object.values(cart)
  
  // Calculate totals
  const { totalItems, subtotal } = useMemo(() => {
    let items = 0
    let sub = 0
    
    cartItems.forEach(item => {
      items += item.cantidad
      sub += item.producto.precio * item.cantidad
    })
    
    return {
      totalItems: items,
      subtotal: sub,
    }
  }, [cartItems])

  const handleConfirm = async (contactData: { nombre: string }) => {
    try {
      setIsSubmitting(true)
      
      const formData = new FormData()
      formData.append('nombre', contactData.nombre)
      // Agregamos campos vacíos requeridos por el backend si los hay, 
      // aunque el backend usa apellido || '' si no se envía
      formData.append('apellido', '')
      formData.append('telefono', '')
      
      formData.append('precioEstimado', subtotal.toString())
      
      const ordenConfig = cartItems.map(item => ({
        id: item.producto.id,
        nombre: item.producto.nombre,
        precioUnitario: item.producto.precio,
        cantidad: item.cantidad
      }))
      
      formData.append('configuracion', JSON.stringify({
        productos: ordenConfig,
        totalItems,
        subtotal
      }))
      
      await api.solicitudes.createOrden(formData)
      
      toast.success('¡Orden enviada con éxito!')
      onClearCart()
      setIsConfirming(false)
      
    } catch (error) {
      console.error(error)
      toast.error('Ocurrió un error al enviar la orden.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Card className="flex flex-col border-border/50 shadow-md">
        <CardHeader className="border-b bg-muted/20 pb-4">
          <CardTitle className="flex items-center justify-between text-xl">
            <span className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" />
              Tu Orden
            </span>
            {totalItems > 0 && (
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-medium text-primary">
                {totalItems} art.
              </span>
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 p-0">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <ShoppingBag className="mb-4 h-12 w-12 opacity-20" />
              <p>Tu orden está vacía.</p>
              <p className="text-sm">Agrega productos para empezar.</p>
            </div>
          ) : (
            <div className="max-h-[40vh] min-h-[150px] overflow-y-auto">
              <div className="flex flex-col divide-y">
                {cartItems.map((item) => (
                  <div key={item.producto.id} className="flex justify-between p-4 hover:bg-muted/10 transition-colors">
                    <div className="flex flex-col">
                      <span className="font-medium line-clamp-1">{item.producto.nombre}</span>
                      <span className="text-sm text-muted-foreground">
                        {item.cantidad} x {currency(item.producto.precio)}
                      </span>
                    </div>
                    <div className="font-medium">
                      {currency(item.cantidad * item.producto.precio)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
        
        {totalItems > 0 && (
          <CardFooter className="flex-col items-stretch border-t bg-muted/5 p-4 pt-4">
            <div className="mb-4 space-y-2">
              <div className="flex justify-between border-t pt-2 text-lg font-bold">
                <span>Total Estimado</span>
                <span className="text-primary">{currency(subtotal)}</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
                onClick={onClearCart}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button 
                className="flex-1 gap-2 shadow-sm"
                onClick={() => setIsConfirming(true)}
                disabled={isSubmitting}
              >
                <CheckCircle2 className="h-4 w-4" />
                {isSubmitting ? 'Procesando...' : 'Confirmar Orden'}
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>

      <AnimatePresence>
        {isConfirming && (
          <OrdenConfirmModal
            totalProducts={cartItems.length}
            totalItems={totalItems}
            finalPrice={subtotal}
            onConfirm={handleConfirm}
            onCancel={() => !isSubmitting && setIsConfirming(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
