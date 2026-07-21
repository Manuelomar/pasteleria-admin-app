export type Tipo = "dulce" | "salado" | "bebida" | "material"
export type Disponibilidad = "disponible" | "no-disponible"

export interface Producto {
  id: string
  nombre: string
  categoria: string
  tipo: Tipo
  precio: number
  disponible: boolean
  imagen: string
  descripcion: string
  vendidos: number
  cantidad?: number
  proveedorId?: string
  precioCosto?: number
  precioUber?: number
  historialCostos?: number[]
}

export const tipoLabel: Record<Tipo, string> = {
  dulce: "Dulce",
  salado: "Salado",
  bebida: "Bebida",
  material: "Material",
}
