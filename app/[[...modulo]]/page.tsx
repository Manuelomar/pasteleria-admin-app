"use client"

import { DashboardModule } from "@/components/modules/dashboard-module"
import { CatalogoModule } from "@/components/modules/catalogo-module"
import { ClientesModule } from "@/components/modules/clientes-module"
import { VentasModule } from "@/components/modules/ventas-module"
import { EstadoCuentaModule } from "@/components/modules/estado-cuenta-module"
import { UsuariosModule } from "@/components/modules/usuarios-module"
import { EntregasModule } from "@/components/modules/entregas-module"
import { useParams } from "next/navigation"

export default function Page() {
  const params = useParams()
  const currentModule = params.modulo?.[0] || "dashboard"

  return (
    <>
      {currentModule === "dashboard" && <DashboardModule />}
      {currentModule === "clientes" && <ClientesModule />}
      {currentModule === "catalogo" && <CatalogoModule />}
      {currentModule === "ventas" && <VentasModule />}
      {currentModule === "estado-cuenta" && <EstadoCuentaModule />}
      {currentModule === "usuarios" && <UsuariosModule />}
      {currentModule === "entregas" && <EntregasModule />}
    </>
  )
}
