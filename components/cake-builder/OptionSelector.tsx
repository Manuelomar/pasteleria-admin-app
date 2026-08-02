'use client'

import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import type { CakeOption, ColorOption } from './types/cake'

// ─── Generic Option Card ──────────────────────────────────────────────────────

interface OptionCardProps<T extends string> {
  option: CakeOption<T>
  isSelected: boolean
  onSelect: (value: T) => void
  formatPrice?: (amount: number) => string
}

export function OptionCard<T extends string>({
  option,
  isSelected,
  onSelect,
  formatPrice,
}: OptionCardProps<T>) {
  return (
    <motion.button
      type="button"
      role="radio"
      aria-checked={isSelected}
      aria-label={`${option.label}${option.extraPrice && formatPrice ? ` — ${formatPrice(option.extraPrice)} extra` : ''}`}
      onClick={() => onSelect(option.value)}
      whileTap={{ scale: 0.95 }}
      className={cn(
        'relative flex w-full flex-col items-start rounded-xl border-2 px-4 py-3 text-left',
        'transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'cursor-pointer select-none',
        isSelected
          ? 'border-primary bg-primary/8 text-primary'
          : 'border-border bg-card text-foreground hover:border-primary/40 hover:bg-accent/60',
      )}
    >
      {/* Indicador de selección */}
      <span
        aria-hidden="true"
        className={cn(
          'absolute right-3 top-3 flex h-4 w-4 items-center justify-center rounded-full border-2 transition-colors duration-150',
          isSelected
            ? 'border-primary bg-primary'
            : 'border-muted-foreground/40 bg-transparent',
        )}
      >
        {isSelected && (
          <span className="block h-2 w-2 rounded-full bg-primary-foreground" />
        )}
      </span>

      <span className="pr-6 text-sm font-semibold leading-tight">{option.label}</span>

      {option.description && (
        <span className="mt-0.5 text-xs text-muted-foreground">{option.description}</span>
      )}

      {option.extraPrice !== undefined && formatPrice && (
        <span
          className={cn(
            'mt-1.5 rounded-full px-2 py-0.5 text-xs font-medium',
            isSelected
              ? 'bg-primary/15 text-primary'
              : 'bg-muted text-muted-foreground',
          )}
        >
          +{formatPrice(option.extraPrice)}
        </span>
      )}
    </motion.button>
  )
}

// ─── Color Swatch ─────────────────────────────────────────────────────────────

interface ColorSwatchProps {
  option: ColorOption
  isSelected: boolean
  onSelect: (value: ColorOption['value']) => void
}

export function ColorSwatch({ option, isSelected, onSelect }: ColorSwatchProps) {
  return (
    <motion.button
      type="button"
      role="radio"
      aria-checked={isSelected}
      aria-label={option.label}
      onClick={() => onSelect(option.value)}
      whileTap={{ scale: 0.9 }}
      title={option.label}
      className={cn(
        'group relative flex h-10 w-10 flex-col items-center justify-center rounded-full',
        'border-2 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'cursor-pointer',
        isSelected
          ? 'border-primary shadow-md shadow-primary/20 scale-110'
          : 'border-border hover:border-primary/50 hover:scale-105',
      )}
      style={{ backgroundColor: option.hex }}
    >
      {/* Tilde de selección */}
      {isSelected && (
        <span
          aria-hidden="true"
          className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground shadow"
        >
          <svg
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-2.5 w-2.5"
          >
            <path
              d="M2 6l3 3 5-5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      )}

      {/* Nombre accesible visible en tooltip nativo */}
      <span className="sr-only">{option.label}</span>
    </motion.button>
  )
}
