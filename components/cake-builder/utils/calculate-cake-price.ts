import type { CakeConfiguration, CakePriceBreakdown, PriceExtra } from '../types/cake'
import { BASE_PRICES, EXTRA_PRICES } from '../constants/cake-options'

/**
 * Formats a number as "RD$1,800"
 */
export function formatCakePrice(amount: number): string {
  return `RD$${amount.toLocaleString('es-DO')}`
}

/**
 * Pure function — calculates the price breakdown for a given CakeConfiguration.
 * Returns: base price, extras with labels, and total.
 *
 * Extras:
 *  - Más de 2 colores: +RD$300
 *  - Topper una capa: +RD$250 (desde)
 *  - Topper doble capa 3D: +RD$350 (desde)
 *
 * Incluido gratis:
 *  - Decoración sencilla
 *  - Vela
 *  - Hasta 2 colores cálidos
 *  - Cobertura adicional de dulce de leche o piña sobre el suspiro
 */
export function calculateCakePrice(config: CakeConfiguration): CakePriceBreakdown {
  const base = BASE_PRICES[config.size][config.filling]

  const extras: PriceExtra[] = []

  if (config.colorCount === 'more-than-two') {
    extras.push({ label: 'Más de 2 colores', amount: EXTRA_PRICES.moreThanTwoColors })
  }

  if (config.topper === 'single-layer') {
    extras.push({ label: 'Topper una capa', amount: EXTRA_PRICES.topperSingleLayer })
  } else if (config.topper === 'double-layer-3d') {
    extras.push({ label: 'Topper doble capa 3D', amount: EXTRA_PRICES.topperDoubleLayer3d })
  }

  const total = base + extras.reduce((sum, e) => sum + e.amount, 0)

  return { base, extras, total }
}
