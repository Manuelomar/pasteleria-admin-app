import { useState, useRef, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'motion/react'
import { X, Upload, Trash2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { currency } from '@/types'

interface ComboConfirmModalProps {
  onConfirm: (data: {
    nombre: string
    apellido: string
    correo: string
    telefono: string
    imageFile: File | null
  }) => void
  onCancel: () => void
  totalProducts: number
  totalItems: number
  discountTotal: number
  finalPrice: number
}

export function ComboConfirmModal({
  onConfirm,
  onCancel,
  totalProducts,
  totalItems,
  discountTotal,
  finalPrice,
}: ComboConfirmModalProps) {
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [correo, setCorreo] = useState('')
  const [telefono, setTelefono] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onConfirm({ nombre, apellido, correo, telefono, imageFile: null })
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onCancel])

  const modalContent = (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onCancel} />

      <motion.div
        className="relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-2xl"
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="font-heading text-2xl font-bold">Confirma tu Combo</h2>
            <p className="text-sm text-muted-foreground">Revisa el resumen e ingresa tus datos de contacto.</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel} className="rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid gap-8 md:grid-cols-2">
            
            {/* Columna Izquierda: Datos del Formulario */}
            <form id="combo-contact-form" onSubmit={handleSubmit} className="space-y-4">
              <h3 className="font-semibold">Datos de Contacto</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre <span className="text-destructive">*</span></Label>
                  <Input id="nombre" required value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej. Juan" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellido">Apellido <span className="text-destructive">*</span></Label>
                  <Input id="apellido" required value={apellido} onChange={e => setApellido(e.target.value)} placeholder="Ej. Pérez" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono (WhatsApp) <span className="text-destructive">*</span></Label>
                <Input id="telefono" type="tel" required value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="809-555-1234" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="correo">Correo Electrónico (Opcional)</Label>
                <Input id="correo" type="email" value={correo} onChange={e => setCorreo(e.target.value)} placeholder="juan@ejemplo.com" />
              </div>
            </form>

            {/* Columna Derecha: Resumen de la Orden */}
            <div>
              <h3 className="font-semibold mb-4">Resumen de la Orden</h3>
              <Card className="bg-muted/30">
                <CardContent className="p-4 space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Variedad de productos:</span>
                    <span className="font-medium">{totalProducts}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total artículos:</span>
                    <span className="font-medium">{totalItems}</span>
                  </div>
                  
                  {discountTotal > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Descuento aplicado:</span>
                      <span className="font-medium">- {currency(discountTotal)}</span>
                    </div>
                  )}
                  
                  <div className="pt-4 border-t flex justify-between items-end">
                    <span className="font-bold">Total a pagar</span>
                    <span className="font-heading text-2xl font-bold text-primary">
                      {currency(finalPrice)}
                    </span>
                  </div>
                </CardContent>
              </Card>
              
              <div className="mt-6 rounded-md bg-primary/5 p-4 text-sm text-primary">
                <p><strong>Nota:</strong> Tu solicitud será revisada por nuestro equipo. Nos pondremos en contacto contigo vía WhatsApp para confirmar los detalles finales y el pago.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t bg-muted/20 px-6 py-4">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" form="combo-contact-form" className="gap-2 shadow-sm">
            <Send className="h-4 w-4" />
            Enviar Solicitud
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )

  if (typeof document === 'undefined') return null
  return createPortal(modalContent, document.body)
}
