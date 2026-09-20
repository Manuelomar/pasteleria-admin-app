import { useState, useRef, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'motion/react'
import { X, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { currency } from '@/types'

interface OrdenConfirmModalProps {
  onConfirm: (data: { nombre: string }) => void
  onCancel: () => void
  totalProducts: number
  totalItems: number
  finalPrice: number
}

export function OrdenConfirmModal({
  onConfirm,
  onCancel,
  totalProducts,
  totalItems,
  finalPrice,
}: OrdenConfirmModalProps) {
  const [nombre, setNombre] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onConfirm({ nombre })
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
        className="relative z-10 flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-2xl"
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="font-heading text-2xl font-bold">Confirma tu Orden</h2>
            <p className="text-sm text-muted-foreground">Ingresa tu nombre para registrar la orden.</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel} className="rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 grid gap-8 md:grid-cols-2">
          {/* Datos del Formulario */}
          <form id="orden-contact-form" onSubmit={handleSubmit} className="space-y-4">
            <h3 className="font-semibold">Datos</h3>
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre <span className="text-destructive">*</span></Label>
              <Input 
                id="nombre" 
                required 
                value={nombre} 
                onChange={e => setNombre(e.target.value)} 
                placeholder="Ingresa tu nombre..." 
                autoFocus
              />
            </div>
          </form>

          {/* Resumen */}
          <div>
            <h3 className="font-semibold mb-4">Resumen</h3>
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
                <div className="pt-4 border-t flex justify-between items-end">
                  <span className="font-bold">Total a pagar</span>
                  <span className="font-heading text-2xl font-bold text-primary">
                    {currency(finalPrice)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t bg-muted/20 px-6 py-4">
          <Button variant="outline" onClick={onCancel} type="button">
            Cancelar
          </Button>
          <Button type="submit" form="orden-contact-form" className="gap-2 shadow-sm">
            <Send className="h-4 w-4" />
            Enviar Orden
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )

  if (typeof document === 'undefined') return null
  return createPortal(modalContent, document.body)
}
