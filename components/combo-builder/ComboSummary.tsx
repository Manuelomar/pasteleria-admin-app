import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { currency } from '@/types'
import { ShoppingBag, Trash2, CheckCircle2 } from 'lucide-react'
import { type CartItem } from './ComboBuilder'
import { ComboConfirmModal } from './ComboConfirmModal'
import { api } from '@/services'
import { toast } from 'sonner'
import { AnimatePresence } from 'motion/react'

interface ComboSummaryProps {
  cart: Record<string, CartItem>
  onClearCart: () => void
}

export function ComboSummary({ cart, onClearCart }: ComboSummaryProps) {
  const [isConfirming, setIsConfirming] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const cartItems = Object.values(cart)
  
  // Calculate totals
  const { totalItems, subtotal, discountPercent, discountTotal, finalPrice, nextTierMissing, nextTierPercent } = useMemo(() => {
    let items = 0
    let sub = 0
    
    cartItems.forEach(item => {
      items += item.cantidad
      sub += item.producto.precio * item.cantidad
    })
    
    // Apply percentage discount
    let discountPercent = 0
    let nextTierMissing = 0
    let nextTierPercent = 0

    if (items >= 15) {
      discountPercent = 0.10
    } else if (items >= 9) {
      discountPercent = 0.08
      nextTierMissing = 15 - items
      nextTierPercent = 10
    } else if (items >= 5) {
      discountPercent = 0.05
      nextTierMissing = 9 - items
      nextTierPercent = 8
    } else if (items >= 1) {
      discountPercent = 0
      nextTierMissing = 5 - items
      nextTierPercent = 5
    }

    const discount = sub * discountPercent
    const final = sub - discount
    
    return {
      totalItems: items,
      subtotal: sub,
      discountPercent: discountPercent * 100,
      discountTotal: discount,
      finalPrice: final > 0 ? final : 0,
      nextTierMissing,
      nextTierPercent
    }
  }, [cartItems])

  const handleConfirm = async (contactData: {
    nombre: string
    apellido: string
    correo: string
    telefono: string
    imageFile: File | null
  }) => {
    try {
      setIsSubmitting(true)
      
      const formData = new FormData()
      formData.append('nombre', contactData.nombre)
      formData.append('apellido', contactData.apellido)
      formData.append('telefono', contactData.telefono)
      if (contactData.correo) formData.append('correo', contactData.correo)
      formData.append('precioEstimado', finalPrice.toString())
      
      // Build the configuration JSON
      // Simplify the cart items to avoid sending too much unnecessary data
      const comboConfig = cartItems.map(item => ({
        id: item.producto.id,
        nombre: item.producto.nombre,
        precioUnitario: item.producto.precio,
        cantidad: item.cantidad
      }))
      
      formData.append('configuracion', JSON.stringify({
        productos: comboConfig,
        totalItems,
        subtotal,
        descuentoAplicado: discountTotal
      }))
      
      if (contactData.imageFile) {
        formData.append('imagen', contactData.imageFile)
      }
      
      await api.solicitudes.createCombo(formData)
      
      toast.success('¡Solicitud de combo enviada con éxito!')
      onClearCart()
      setIsConfirming(false)
      
    } catch (error) {
      console.error(error)
      toast.error('Ocurrió un error al enviar la solicitud.')
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
              Tu Combo
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
              <p>Tu combo está vacío.</p>
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
            
            {nextTierMissing > 0 && (
              <div className="mb-4 rounded-md bg-blue-50 dark:bg-blue-900/20 p-3 text-sm text-blue-700 dark:text-blue-300">
                Agrega <strong>{nextTierMissing}</strong> producto{nextTierMissing > 1 ? 's' : ''} más y obtén <strong>{nextTierPercent}%</strong> de descuento.
              </div>
            )}

            <div className="mb-4 space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span>{currency(subtotal)}</span>
              </div>
              
              {discountTotal > 0 && (
                <div className="flex justify-between text-sm text-green-600 font-medium">
                  <span>Descuento ({discountPercent}%)</span>
                  <span>- {currency(discountTotal)}</span>
                </div>
              )}
              
              <div className="flex justify-between border-t pt-2 text-lg font-bold">
                <span>Total Estimado</span>
                <span className="text-primary">{currency(finalPrice)}</span>
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
                {isSubmitting ? 'Procesando...' : 'Solicitar Combo'}
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>

      <AnimatePresence>
        {isConfirming && (
          <ComboConfirmModal
            totalProducts={cartItems.length}
            totalItems={totalItems}
            discountTotal={discountTotal}
            finalPrice={finalPrice}
            onConfirm={handleConfirm}
            onCancel={() => !isSubmitting && setIsConfirming(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
