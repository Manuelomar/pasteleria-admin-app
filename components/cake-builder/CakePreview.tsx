'use client'

import { motion, AnimatePresence } from 'motion/react'
import styles from './cake-preview.module.css'
import type { CakeConfiguration } from './types/cake'
import {
  FILLING_COLORS,
  COLOR_HEX_MAP,
  EXTRA_FROSTING_COLORS,
} from './constants/cake-options'

interface CakePreviewProps {
  config: CakeConfiguration
}

// Color del bizcocho esponjoso (fijo — el sabor es el relleno, no la miga)
const SPONGE = {
  layer: '#f5e6c8',
  layerLight: 'color-mix(in srgb, #f5e6c8 60%, #fff)',
  layerDark: '#e0c89a',
}

export function CakePreview({ config }: CakePreviewProps) {
  const fillingColor = FILLING_COLORS[config.filling]
  const frostingColor = COLOR_HEX_MAP[config.primaryColor] ?? '#f9a8c9'
  const extraDrizzleColor = EXTRA_FROSTING_COLORS[config.extraFrosting]

  // Dimensiones según tamaño
  const isHalf = config.size === 'half-pound'
  const cakeWidth = isHalf ? 180 : 240
  const layerHeight = isHalf ? 50 : 64
  const plateWidth = isHalf ? 220 : 280

  const cssVars = {
    '--cake-layer-color': SPONGE.layer,
    '--cake-layer-light': SPONGE.layerLight,
    '--cake-layer-dark': SPONGE.layerDark,
    '--filling-color': fillingColor,
    '--frosting-color': frostingColor,
    '--cake-width': `${cakeWidth}px`,
    '--cake-plate-width': `${plateWidth}px`,
    '--cake-shadow-width': `${cakeWidth - 10}px`,
    '--layer-height': `${layerHeight}px`,
  } as React.CSSProperties

  const showTopper = config.topper !== 'none'
  const isDoubleTopper = config.topper === 'double-layer-3d'

  return (
    <div className={styles.scene} style={cssVars}>
      {/* Sombra */}
      <div className={styles.cakeShadow} />

      {/* Plato */}
      <div className={styles.plate} />

      {/* Cuerpo del bizcocho */}
      <motion.div
        className={styles.cakeBody}
        layout
        style={{ width: cakeWidth }}
        initial={{ opacity: 0, scale: 0.85, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 22,
          layout: { type: 'spring', stiffness: 200, damping: 22 },
        }}
      >
        {/* Cobertura (frosting) */}
        <motion.div
          className={styles.frosting}
          layout
          key={`frosting-${config.primaryColor}`}
          initial={{ scaleX: 0.9, opacity: 0.7 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        >
          {/* Topper */}
          <AnimatePresence>
            {showTopper && (
              <motion.div
                className={styles.topper}
                key="topper"
                initial={{ opacity: 0, y: 20, scale: 0.7 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.7 }}
                transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                aria-hidden="true"
              >
                {/* Doble capa: segundo elemento detrás */}
                {isDoubleTopper && (
                  <div className={styles.topperBack}>
                    <svg
                      viewBox="0 0 32 32"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className={styles.topperStarBack}
                    >
                      <path
                        d="M16 2l3.09 9.52H29L21.18 17.48l3.09 9.52L16 21.02l-8.27 6L10.82 17.48 3 11.52h9.91L16 2z"
                        fill="#ffd580"
                        stroke="#e5b84a"
                        strokeWidth="0.5"
                      />
                    </svg>
                  </div>
                )}
                {/* Capa principal */}
                <svg
                  className={styles.topperStar}
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M16 2l3.09 9.52H29L21.18 17.48l3.09 9.52L16 21.02l-8.27 6L10.82 17.48 3 11.52h9.91L16 2z"
                    fill="#e63946"
                    stroke="#c42f3c"
                    strokeWidth="0.5"
                  />
                </svg>
                <div className={styles.topperStick} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Drips de cobertura principal */}
          <div className={styles.dripsContainer} aria-hidden="true">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={styles.drip} />
            ))}
          </div>

          {/* Drizzle de cobertura adicional (gratis) */}
          <AnimatePresence>
            {extraDrizzleColor && (
              <motion.div
                key={`drizzle-${config.extraFrosting}`}
                className={styles.drizzleContainer}
                style={{ '--drizzle-color': extraDrizzleColor } as React.CSSProperties}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                aria-hidden="true"
              >
                {[1, 2, 3].map((i) => (
                  <div key={i} className={styles.drizzle} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Capa superior de bizcocho */}
        <div className={styles.layer} />

        {/* Relleno */}
        <motion.div
          className={styles.filling}
          key={`filling-${config.filling}`}
          initial={{ scaleX: 0.8, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 280, damping: 20 }}
        />

        {/* Capa inferior de bizcocho */}
        <div className={styles.layer} />
      </motion.div>
    </div>
  )
}
