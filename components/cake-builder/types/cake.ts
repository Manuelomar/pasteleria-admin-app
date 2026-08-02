// ─── Cake Configuration Types ────────────────────────────────────────────────

export type CakeSize = 'half-pound' | 'one-pound'

export type CakeFilling = 'dulce-de-leche' | 'pastry-cream' | 'pineapple'

export type CakeColor =
  | 'white'
  | 'pink'
  | 'peach'
  | 'lavender'
  | 'gold'
  | 'mint'

export type ColorCount = 'one-two' | 'more-than-two'

export type ExtraFrosting = 'none' | 'dulce-de-leche' | 'pineapple'

export type CakeTopper = 'none' | 'single-layer' | 'double-layer-3d'

export interface CakeConfiguration {
  size: CakeSize
  filling: CakeFilling
  primaryColor: CakeColor
  colorCount: ColorCount
  extraFrosting: ExtraFrosting
  topper: CakeTopper
}

// ─── Price Calculation Types ──────────────────────────────────────────────────

export interface PriceExtra {
  label: string
  amount: number
}

export interface CakePriceBreakdown {
  base: number
  extras: PriceExtra[]
  total: number
}

// ─── Option Item (for UI rendering) ──────────────────────────────────────────

export interface CakeOption<T extends string> {
  value: T
  label: string
  extraPrice?: number
  description?: string
  isFree?: boolean
}

export interface ColorOption {
  value: CakeColor
  label: string
  hex: string
}
