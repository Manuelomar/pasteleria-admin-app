'use client'

import type { CakeConfiguration } from './types/cake'
import { OptionCard, ColorSwatch } from './OptionSelector'
import { formatCakePrice } from './utils/calculate-cake-price'
import {
  SIZE_OPTIONS,
  FILLING_OPTIONS,
  COLOR_COUNT_OPTIONS,
  EXTRA_FROSTING_OPTIONS,
  TOPPER_OPTIONS,
  COLOR_OPTIONS,
  BASE_PRICES,
} from './constants/cake-options'
import { Gift, Cake } from 'lucide-react'

interface CakeOptionsProps {
  config: CakeConfiguration
  onChange: <K extends keyof CakeConfiguration>(key: K, value: CakeConfiguration[K]) => void
}

// ─── Wrapper de sección semántica ─────────────────────────────────────────────

function OptionSection({
  legend,
  children,
  hint,
}: {
  legend: string
  children: React.ReactNode
  hint?: string
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="mb-2 text-sm font-bold uppercase tracking-widest text-muted-foreground">
        {legend}
      </legend>
      {hint && (
        <p className="mb-2 text-xs text-muted-foreground">{hint}</p>
      )}
      {children}
    </fieldset>
  )
}

// ─── Chip de "incluido gratis" ────────────────────────────────────────────────

function FreeTag({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400">
      <Gift className="h-3.5 w-3.5 shrink-0" />
      <span>{label}</span>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function CakeOptions({ config, onChange }: CakeOptionsProps) {
  return (
    <div className="space-y-7">

      {/* ── TAMAÑO ── */}
      <OptionSection legend="Tamaño">
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Tamaño del bizcocho">
          {SIZE_OPTIONS.map((opt) => (
            <OptionCard
              key={opt.value}
              option={opt}
              isSelected={config.size === opt.value}
              onSelect={(v) => onChange('size', v)}
            />
          ))}
        </div>
      </OptionSection>

      {/* ── RELLENO ── */}
      <OptionSection legend="Relleno">
        <div
          className="grid grid-cols-1 gap-2 sm:grid-cols-3"
          role="radiogroup"
          aria-label="Relleno del bizcocho"
        >
          {FILLING_OPTIONS.map((opt) => {
            const price = BASE_PRICES[config.size][opt.value]
            return (
              <OptionCard
                key={opt.value}
                option={{ ...opt, description: formatCakePrice(price) }}
                isSelected={config.filling === opt.value}
                onSelect={(v) => onChange('filling', v)}
              />
            )
          })}
        </div>
      </OptionSection>

      {/* ── COLOR DE LA COBERTURA ── */}
      <OptionSection legend="Color de la cobertura">
        <div
          className="flex flex-wrap gap-3 py-1"
          role="radiogroup"
          aria-label="Color de la cobertura"
        >
          {COLOR_OPTIONS.map((opt) => (
            <ColorSwatch
              key={opt.value}
              option={opt}
              isSelected={config.primaryColor === opt.value}
              onSelect={(v) => onChange('primaryColor', v)}
            />
          ))}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Color seleccionado:{' '}
          <span className="font-medium text-foreground">
            {COLOR_OPTIONS.find((c) => c.value === config.primaryColor)?.label ?? '—'}
          </span>
        </p>
      </OptionSection>

      {/* ── CANTIDAD DE COLORES ── */}
      <OptionSection
        legend="Cantidad de colores"
        hint="Hasta 2 colores cálidos están incluidos en el precio."
      >
        <div
          className="grid grid-cols-2 gap-2"
          role="radiogroup"
          aria-label="Cantidad de colores del bizcocho"
        >
          {COLOR_COUNT_OPTIONS.map((opt) => (
            <OptionCard
              key={opt.value}
              option={opt}
              isSelected={config.colorCount === opt.value}
              onSelect={(v) => onChange('colorCount', v)}
              formatPrice={formatCakePrice}
            />
          ))}
        </div>
      </OptionSection>

      {/* ── COBERTURA ADICIONAL (GRATIS) ── */}
      <OptionSection legend="Cobertura adicional">
        <FreeTag label="Cobertura adicional sobre el suspiro incluida GRATIS" />
        <div
          className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3"
          role="radiogroup"
          aria-label="Tipo de cobertura adicional"
        >
          {EXTRA_FROSTING_OPTIONS.map((opt) => (
            <OptionCard
              key={opt.value}
              option={opt}
              isSelected={config.extraFrosting === opt.value}
              onSelect={(v) => onChange('extraFrosting', v)}
            />
          ))}
        </div>
      </OptionSection>

      {/* ── TOPPER ── */}
      <OptionSection
        legend="Topper"
        hint="Figuras de cartonite personalizadas. El precio puede variar según tamaño y complejidad."
      >
        <div
          className="grid grid-cols-1 gap-2 sm:grid-cols-3"
          role="radiogroup"
          aria-label="Tipo de topper"
        >
          {TOPPER_OPTIONS.map((opt) => (
            <OptionCard
              key={opt.value}
              option={opt}
              isSelected={config.topper === opt.value}
              onSelect={(v) => onChange('topper', v)}
              formatPrice={formatCakePrice}
            />
          ))}
        </div>
      </OptionSection>

      {/* ── INCLUIDO SIEMPRE ── */}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
        <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
          <Cake className="h-3.5 w-3.5" />
          Incluido siempre sin costo adicional
        </p>
        <ul className="space-y-1">
          <FreeTag label="Decoración sencilla" />
          <FreeTag label="Vela" />
          <FreeTag label="Hasta 2 colores cálidos" />
          <FreeTag label="Cobertura adicional de dulce de leche o piña" />
        </ul>
      </div>

    </div>
  )
}
