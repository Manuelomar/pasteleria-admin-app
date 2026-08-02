'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  Cake,
  CheckCircle,
  Gift,
  Upload,
  X,
  ImageIcon,
  AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import type { CakeConfiguration } from './types/cake'
import { calculateCakePrice, formatCakePrice } from './utils/calculate-cake-price'
import {
  SIZE_OPTIONS,
  FILLING_OPTIONS,
  COLOR_COUNT_OPTIONS,
  EXTRA_FROSTING_OPTIONS,
  TOPPER_OPTIONS,
  COLOR_OPTIONS,
} from './constants/cake-options'
import { api } from '@/services'

interface CakeSummaryProps {
  config: CakeConfiguration
}

// ─── Fila de resumen ──────────────────────────────────────────────────────────

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  )
}

function FreeSummaryRow({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
        <Gift className="h-3 w-3" />
        GRATIS
      </span>
    </div>
  )
}

// ─── Modal de confirmación ────────────────────────────────────────────────────

interface ContactInfo {
  nombre: string
  apellido: string
  correo: string
  telefono: string
}

interface ConfirmModalProps {
  config: CakeConfiguration
  imagePreview: string | null
  imageFile: File | null
  onConfirm: (contactInfo: ContactInfo) => Promise<void>
  onCancel: () => void
}

function ConfirmModal({ config, imagePreview, imageFile, onConfirm, onCancel }: ConfirmModalProps) {
  const [loading, setLoading] = useState(false)
  const [contact, setContact] = useState<ContactInfo>({
    nombre: '',
    apellido: '',
    correo: '',
    telefono: '',
  })
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onConfirm(contact)
    } finally {
      setLoading(false)
    }
  }
  const { base, extras, total } = calculateCakePrice(config)

  const sizeLabel = SIZE_OPTIONS.find((o) => o.value === config.size)?.label ?? '—'
  const fillingLabel = FILLING_OPTIONS.find((o) => o.value === config.filling)?.label ?? '—'
  const colorLabel = COLOR_OPTIONS.find((o) => o.value === config.primaryColor)?.label ?? '—'
  const colorHex = COLOR_OPTIONS.find((o) => o.value === config.primaryColor)?.hex ?? '#f9a8c9'
  const colorCountLabel = COLOR_COUNT_OPTIONS.find((o) => o.value === config.colorCount)?.label ?? '—'
  const extraFrostingOpt = EXTRA_FROSTING_OPTIONS.find((o) => o.value === config.extraFrosting)
  const topperOpt = TOPPER_OPTIONS.find((o) => o.value === config.topper)

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onCancel])

  const modalContent = (
    // Backdrop
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Overlay oscuro */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Ventana del modal */}
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-card shadow-2xl"
        initial={{ opacity: 0, scale: 0.92, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 16 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
      >
        {/* Encabezado */}
        <div className="flex items-start justify-between gap-3 border-b border-border p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <AlertCircle className="h-5 w-5 text-primary" />
            </span>
            <div>
              <h2
                id="confirm-title"
                className="font-heading text-base font-bold text-foreground"
              >
                ¿Enviar esta solicitud?
              </h2>
              <p className="text-sm text-muted-foreground">
                Revisa tu diseño antes de confirmar.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Cerrar"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Cuerpo del modal con scroll */}
        <div className="max-h-[60vh] overflow-y-auto">
          
          <form id="solicitud-form" onSubmit={handleSubmit} className="p-5">
            <h3 className="mb-3 text-sm font-semibold text-foreground border-b border-border pb-2">
              Tus datos de contacto
            </h3>
            
            <div className="mb-5 grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="nombre" className="text-xs font-medium text-foreground">Nombre *</label>
                <input
                  id="nombre"
                  required
                  value={contact.nombre}
                  onChange={e => setContact({ ...contact, nombre: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="apellido" className="text-xs font-medium text-foreground">Apellido *</label>
                <input
                  id="apellido"
                  required
                  value={contact.apellido}
                  onChange={e => setContact({ ...contact, apellido: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="col-span-2 space-y-1">
                <label htmlFor="telefono" className="text-xs font-medium text-foreground">Teléfono / WhatsApp *</label>
                <input
                  id="telefono"
                  required
                  type="tel"
                  value={contact.telefono}
                  onChange={e => setContact({ ...contact, telefono: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="col-span-2 space-y-1">
                <label htmlFor="correo" className="text-xs font-medium text-foreground">Correo (Opcional)</label>
                <input
                  id="correo"
                  type="email"
                  value={contact.correo}
                  onChange={e => setContact({ ...contact, correo: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>

            <h3 className="mb-3 text-sm font-semibold text-foreground border-b border-border pb-2">
              Resumen de tu diseño
            </h3>
            
            {/* Resumen de configuración */}
            <div className="mb-4 space-y-2 rounded-xl bg-muted/50 p-4 text-sm">
              <SummaryRow label="Tamaño" value={sizeLabel} />
              <SummaryRow label="Relleno" value={fillingLabel} />
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">Color</span>
                <div className="flex items-center gap-1.5">
                  <span
                    className="inline-block h-3.5 w-3.5 rounded-full border border-border"
                    style={{ backgroundColor: colorHex }}
                    aria-hidden="true"
                  />
                  <span className="font-medium text-foreground">{colorLabel}</span>
                </div>
              </div>
              <SummaryRow label="Colores" value={colorCountLabel} />
              {config.extraFrosting !== 'none' && extraFrostingOpt && (
                <SummaryRow label="Cobertura adicional" value={`${extraFrostingOpt.label} (GRATIS)`} />
              )}
              {config.topper !== 'none' && topperOpt && (
                <SummaryRow label="Topper" value={topperOpt.label} />
              )}
            </div>

            {/* Desglose de precio */}
            <div className="mb-4 space-y-1 rounded-xl border border-border p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Precio base</span>
                <span>{formatCakePrice(base)}</span>
              </div>
              {extras.map((e) => (
                <div key={e.label} className="flex justify-between">
                  <span className="text-muted-foreground">+ {e.label}</span>
                  <span className="text-primary">{formatCakePrice(e.amount)}</span>
                </div>
              ))}
              <div className="flex justify-between border-t border-border pt-2 font-bold">
                <span>Total estimado</span>
                <span className="text-primary">{formatCakePrice(total)}</span>
              </div>
            </div>

            {/* Vista previa de imagen de referencia */}
            {imagePreview && (
              <div className="mb-2 overflow-hidden rounded-xl border border-border">
                <p className="border-b border-border px-3 py-2 text-xs font-medium text-muted-foreground">
                  Imagen de referencia adjunta
                </p>
                <img
                  src={imagePreview}
                  alt="Referencia de diseño"
                  className="max-h-48 w-full object-contain bg-muted/30 p-2"
                />
              </div>
            )}
          </form>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3 border-t border-border p-5">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
          >
            Cancelar
          </button>
          <motion.button
            type="submit"
            form="solicitud-form"
            disabled={loading}
            whileTap={{ scale: 0.97 }}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/25 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-70"
          >
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-r-transparent" />
            ) : (
              <Cake className="h-4 w-4" />
            )}
            {loading ? 'Enviando...' : 'Sí, enviar solicitud'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )

  if (typeof document === 'undefined') return null

  return createPortal(modalContent, document.body)
}

// ─── CakeSummary (componente principal) ──────────────────────────────────────

export function CakeSummary({ config }: CakeSummaryProps) {
  const [requested, setRequested] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { base, extras, total } = calculateCakePrice(config)

  const sizeLabel = SIZE_OPTIONS.find((o) => o.value === config.size)?.label ?? '—'
  const fillingLabel = FILLING_OPTIONS.find((o) => o.value === config.filling)?.label ?? '—'
  const colorLabel = COLOR_OPTIONS.find((o) => o.value === config.primaryColor)?.label ?? '—'
  const colorHex = COLOR_OPTIONS.find((o) => o.value === config.primaryColor)?.hex ?? '#f9a8c9'
  const colorCountLabel = COLOR_COUNT_OPTIONS.find((o) => o.value === config.colorCount)?.label ?? '—'
  const extraFrostingOpt = EXTRA_FROSTING_OPTIONS.find((o) => o.value === config.extraFrosting)
  const topperOpt = TOPPER_OPTIONS.find((o) => o.value === config.topper)

  // ─── Manejo de imagen de referencia ────────────────────────────────────────

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => {
      setImagePreview(ev.target?.result as string)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleRemoveImage = useCallback(() => {
    setImagePreview(null)
    setImageFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => {
      setImagePreview(ev.target?.result as string)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }, [])

  // ─── Flujo de confirmación ─────────────────────────────────────────────────

  const handleRequestClick = () => {
    setShowConfirm(true)
  }

  const handleConfirm = async (contactInfo: ContactInfo) => {
    try {
      const formData = new FormData()
      formData.append('nombre', contactInfo.nombre)
      formData.append('apellido', contactInfo.apellido)
      if (contactInfo.correo) formData.append('correo', contactInfo.correo)
      formData.append('telefono', contactInfo.telefono)
      formData.append('configuracion', JSON.stringify(config))
      formData.append('precioEstimado', total.toString())
      if (imageFile) {
        formData.append('imagen', imageFile)
      }

      await api.solicitudes.createBizcocho(formData)

      setShowConfirm(false)
      setRequested(true)
      toast.success('¡Solicitud enviada! Pronto nos pondremos en contacto.', {
        description: 'Tu diseño personalizado ha sido registrado.',
        icon: <Cake className="h-4 w-4" />,
      })
      setTimeout(() => setRequested(false), 4500)
    } catch (error) {
      toast.error('Error al enviar solicitud', {
        description: 'Por favor, intenta de nuevo más tarde.',
      })
    }
  }

  const handleCancel = () => {
    setShowConfirm(false)
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Modal de confirmación (portal sobre el resto de la UI) */}
      <AnimatePresence>
        {showConfirm && (
          <ConfirmModal
            config={config}
            imagePreview={imagePreview}
            imageFile={imageFile}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
          />
        )}
      </AnimatePresence>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h3 className="mb-4 font-heading text-base font-bold text-foreground">
          Tu selección
        </h3>

        {/* Resumen de selección */}
        <div className="space-y-2 border-b border-border pb-4">
          <SummaryRow label="Tamaño" value={sizeLabel} />
          <SummaryRow label="Relleno" value={fillingLabel} />

          <div className="flex items-center justify-between gap-2 text-sm">
            <span className="text-muted-foreground">Color</span>
            <div className="flex items-center gap-1.5">
              <span
                className="inline-block h-3.5 w-3.5 rounded-full border border-border"
                style={{ backgroundColor: colorHex }}
                aria-hidden="true"
              />
              <span className="font-medium text-foreground">{colorLabel}</span>
            </div>
          </div>

          <SummaryRow label="Colores" value={colorCountLabel} />

          {config.extraFrosting !== 'none' && extraFrostingOpt ? (
            <FreeSummaryRow label={`Cobertura: ${extraFrostingOpt.label}`} />
          ) : (
            <SummaryRow label="Cobertura adicional" value="Sin cobertura extra" />
          )}

          {config.topper !== 'none' && topperOpt ? (
            <SummaryRow label="Topper" value={topperOpt.label} />
          ) : (
            <SummaryRow label="Topper" value="Sin topper" />
          )}

          <FreeSummaryRow label="Decoración sencilla" />
          <FreeSummaryRow label="Vela" />
        </div>

        {/* Desglose de precio */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Precio base</span>
            <span className="font-medium">{formatCakePrice(base)}</span>
          </div>

          {extras.map((extra) => (
            <div key={extra.label} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">+ {extra.label}</span>
              <span className="font-medium text-primary">{formatCakePrice(extra.amount)}</span>
            </div>
          ))}

          <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
            <span className="font-bold">Total estimado</span>
            <AnimatePresence mode="wait">
              <motion.span
                key={total}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2 }}
                className="font-heading text-xl font-bold text-primary"
              >
                {formatCakePrice(total)}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        {/* ── Imagen de referencia ── */}
        <div className="mt-5 border-t border-border pt-5">
          <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
            Imagen de referencia
            <span className="text-xs font-normal text-muted-foreground">(opcional)</span>
          </p>
          <p className="mb-3 text-xs text-muted-foreground">
            Adjunta una foto de inspiración o el diseño que tienes en mente.
          </p>

          {imagePreview ? (
            /* Vista previa de la imagen seleccionada */
            <div className="relative overflow-hidden rounded-xl border border-border">
              <img
                src={imagePreview}
                alt="Referencia de diseño seleccionada"
                className="max-h-48 w-full object-contain bg-muted/30 p-2"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                aria-label="Quitar imagen"
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <div className="border-t border-border bg-muted/30 px-3 py-1.5">
                <p className="text-xs text-muted-foreground">
                  ✓ Imagen lista para enviar con la solicitud
                </p>
              </div>
            </div>
          ) : (
            /* Zona de drop / click para subir */
            <div
              role="button"
              tabIndex={0}
              aria-label="Subir imagen de referencia"
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 px-4 py-8 text-center transition-colors hover:border-primary/50 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <Upload className="h-5 w-5 text-muted-foreground" />
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Haz clic o arrastra una imagen aquí
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  JPG, PNG, WEBP · Máx. 10 MB
                </p>
              </div>
            </div>
          )}

          {/* Input oculto */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="sr-only"
            aria-hidden="true"
            tabIndex={-1}
          />
        </div>

        {/* ── Botón de solicitud ── */}
        <motion.button
          type="button"
          onClick={handleRequestClick}
          disabled={requested}
          whileTap={{ scale: 0.97 }}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/25 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {requested ? (
            <>
              <CheckCircle className="h-4 w-4" />
              ¡Solicitud enviada con éxito!
            </>
          ) : (
            <>
              <Cake className="h-4 w-4" />
              Solicitar este bizcocho
            </>
          )}
        </motion.button>

        <p className="mt-3 text-center text-xs text-muted-foreground">
          * El precio del topper puede variar según tamaño y complejidad del diseño.
        </p>
      </div>
    </>
  )
}
