'use client'

import { useReducer } from 'react'
import { motion } from 'motion/react'
import { CakePreview } from './CakePreview'
import { CakeOptions } from './CakeOptions'
import { CakeSummary } from './CakeSummary'
import { DEFAULT_CAKE_CONFIG } from './constants/cake-options'
import type { CakeConfiguration } from './types/cake'

// ─── Reducer ──────────────────────────────────────────────────────────────────

type CakeAction<K extends keyof CakeConfiguration> = {
  type: 'UPDATE'
  key: K
  value: CakeConfiguration[K]
}

function cakeReducer<K extends keyof CakeConfiguration>(
  state: CakeConfiguration,
  action: CakeAction<K>,
): CakeConfiguration {
  return { ...state, [action.key]: action.value }
}

// ─── CakeBuilder (Client Component) ──────────────────────────────────────────

export function CakeBuilder() {
  const [config, dispatch] = useReducer(
    cakeReducer as (state: CakeConfiguration, action: CakeAction<keyof CakeConfiguration>) => CakeConfiguration,
    DEFAULT_CAKE_CONFIG,
  )

  function handleChange<K extends keyof CakeConfiguration>(
    key: K,
    value: CakeConfiguration[K],
  ) {
    dispatch({ type: 'UPDATE', key, value })
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6">

      {/* Encabezado */}
      <motion.header
        className="mb-10 text-center"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <h1 className="font-heading text-3xl font-bold text-foreground md:text-4xl">
          Crea tu Bizcocho
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          Personalízalo y visualiza el resultado en tiempo real
        </p>
      </motion.header>

      {/*
        Layout:
        - Móvil: columna única, preview arriba, opciones abajo
        - Desktop: dos columnas, opciones izquierda, preview + resumen derecha
      */}
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">

        {/* ── PREVIEW (móvil: arriba; desktop: columna derecha) ── */}
        <div className="order-1 flex flex-col gap-4 lg:order-2 lg:w-5/12 lg:sticky lg:top-6">

          {/* Vista previa del bizcocho */}
          <motion.div
            className="overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-secondary to-background p-6 shadow-sm"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 180, damping: 20, delay: 0.1 }}
          >
            <p className="mb-4 text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Vista previa
            </p>
            <CakePreview config={config} />
          </motion.div>

          {/* Resumen y precio */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <CakeSummary config={config} />
          </motion.div>
        </div>

        {/* ── OPCIONES (móvil: debajo; desktop: columna izquierda) ── */}
        <motion.div
          className="order-2 lg:order-1 lg:w-7/12"
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.15 }}
        >
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <CakeOptions config={config} onChange={handleChange} />
          </div>
        </motion.div>

      </div>
    </div>
  )
}
