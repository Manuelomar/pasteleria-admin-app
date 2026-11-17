export interface PedidoYaRow {
  numeroPedido: string
  sucursal: string
  fecha: string
  montoBruto: number
  descuentoLocal: number
  envioLocal: number
  descuentoPeyaUsuarios: number
  montoNetoVenta: number
  montoComisionable: number
  servicioVentasPct: number
  servicioLogisticaPct: number
  servicioVentasMonto: number
  servicioLogisticaMonto: number
  cargoPlus: number
  esPlus: boolean
  metodoPago: string
  cobradoPor: string
  metodoEntrega: string
}

export interface SucursalLiquidacion {
  sucursal: string
  pedidos: number
  montoBruto: number
  descuentoLocal: number
  ventaNeta: number
  comisionVentas: number
  comisionLogistica: number
  totalComisiones: number
  cargoPlus: number
  reintegrosPeya: number
  margenOperativo: number
  publicidad: number
  impuestos: number
  ajustes: number
  gananciaNeta: number
  ventasPagoApp: number
  ventasPagoFueraApp: number
}

export interface LiquidacionResumen {
  id?: string
  titulo?: string
  fechaCarga: string
  fechaInicio?: string
  fechaFin?: string
  totalPedidos: number
  totalBruto: number
  totalDescuentos: number
  totalVentasNetas: number
  totalComisiones: number
  totalPlus: number
  totalReintegros: number
  totalPublicidad: number
  totalImpuestos: number
  totalAjustes: number
  totalLiquidado: number
  metodoDistribucion: "ventas" | "igualitario" | "pedidos"
  porSucursal: Record<string, SucursalLiquidacion>
  pedidos: PedidoYaRow[]
}
