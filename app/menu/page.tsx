import { MenuPublicoModule } from "@/components/modules/menu-publico-module"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: 'Menú | Bizcochao',
  description: 'Catálogo de productos y precios de Bizcochao.',
}

export default function MenuPage() {
  return <MenuPublicoModule />
}
