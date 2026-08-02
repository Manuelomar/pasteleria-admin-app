import type {
  CakeOption,
  CakeSize,
  CakeFilling,
  CakeColor,
  ColorCount,
  ExtraFrosting,
  CakeTopper,
  CakeConfiguration,
  ColorOption,
} from '../types/cake'

// ─── Default Configuration ────────────────────────────────────────────────────

export const DEFAULT_CAKE_CONFIG: CakeConfiguration = {
  size: 'half-pound',
  filling: 'dulce-de-leche',
  primaryColor: 'pink',
  colorCount: 'one-two',
  extraFrosting: 'none',
  topper: 'none',
}

// ─── Sizes ────────────────────────────────────────────────────────────────────

export const SIZE_OPTIONS: CakeOption<CakeSize>[] = [
  { value: 'half-pound', label: 'Media libra' },
  { value: 'one-pound', label: 'Una libra' },
]

// ─── Fillings ─────────────────────────────────────────────────────────────────

export const FILLING_OPTIONS: CakeOption<CakeFilling>[] = [
  { value: 'dulce-de-leche', label: 'Dulce de leche' },
  { value: 'pastry-cream', label: 'Crema pastelera' },
  { value: 'pineapple', label: 'Piña' },
]

// ─── Color Count ──────────────────────────────────────────────────────────────

export const COLOR_COUNT_OPTIONS: CakeOption<ColorCount>[] = [
  {
    value: 'one-two',
    label: 'Hasta 2 colores cálidos',
    description: 'Incluido en el precio',
  },
  {
    value: 'more-than-two',
    label: 'Más de 2 colores',
    extraPrice: 300,
  },
]

// ─── Extra Frosting (gratuita) ────────────────────────────────────────────────

export const EXTRA_FROSTING_OPTIONS: CakeOption<ExtraFrosting>[] = [
  { value: 'none', label: 'Sin cobertura adicional' },
  {
    value: 'dulce-de-leche',
    label: 'Dulce de leche',
    isFree: true,
    description: 'Sobre el suspiro',
  },
  {
    value: 'pineapple',
    label: 'Piña',
    isFree: true,
    description: 'Sobre el suspiro',
  },
]

// ─── Topper ───────────────────────────────────────────────────────────────────

export const TOPPER_OPTIONS: CakeOption<CakeTopper>[] = [
  { value: 'none', label: 'Sin topper' },
  {
    value: 'single-layer',
    label: 'Topper una capa',
    extraPrice: 250,
    description: 'Figura de cartonite',
  },
  {
    value: 'double-layer-3d',
    label: 'Topper doble capa 3D',
    extraPrice: 350,
    description: 'Con efecto 3D',
  },
]

// ─── Colors (cálidos) ─────────────────────────────────────────────────────────

export const COLOR_OPTIONS: ColorOption[] = [
  { value: 'white', label: 'Blanco', hex: '#faf7f5' },
  { value: 'pink', label: 'Rosa', hex: '#f9a8c9' },
  { value: 'peach', label: 'Durazno', hex: '#ffb896' },
  { value: 'lavender', label: 'Lavanda', hex: '#d8b4fe' },
  { value: 'gold', label: 'Dorado', hex: '#ffd580' },
  { value: 'mint', label: 'Menta', hex: '#86efac' },
]

// ─── Base Prices (size × filling) ─────────────────────────────────────────────

export const BASE_PRICES: Record<CakeSize, Record<CakeFilling, number>> = {
  'half-pound': {
    'dulce-de-leche': 1200,
    'pastry-cream': 1100,
    pineapple: 1100,
  },
  'one-pound': {
    'dulce-de-leche': 1800,
    'pastry-cream': 1700,
    pineapple: 1700,
  },
}

// ─── Extra Prices ─────────────────────────────────────────────────────────────

export const EXTRA_PRICES = {
  moreThanTwoColors: 300,
  topperSingleLayer: 250,
  topperDoubleLayer3d: 350,
} as const

// ─── Color Hex Map ────────────────────────────────────────────────────────────

export const COLOR_HEX_MAP: Record<string, string> = Object.fromEntries(
  COLOR_OPTIONS.map((c) => [c.value, c.hex]),
)

// ─── Filling Color Map (para la línea de relleno visual) ─────────────────────

export const FILLING_COLORS: Record<CakeFilling, string> = {
  'dulce-de-leche': '#c8860a',
  'pastry-cream': '#f5e4a0',
  pineapple: '#f0c820',
}

// ─── Extra Frosting Color Map (para el drizzle visual) ───────────────────────

export const EXTRA_FROSTING_COLORS: Record<ExtraFrosting, string | null> = {
  none: null,
  'dulce-de-leche': '#b5720a',
  pineapple: '#d4a800',
}
