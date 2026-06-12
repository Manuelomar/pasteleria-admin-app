"use client"

import { useState, useEffect } from "react"
import { AppShell, type ModuleId } from "@/components/app-shell"
import { DashboardModule } from "@/components/modules/dashboard-module"
import { CatalogoModule } from "@/components/modules/catalogo-module"
import { ClientesModule } from "@/components/modules/clientes-module"
import { VentasModule } from "@/components/modules/ventas-module"
import { GraficosModule } from "@/components/modules/graficos-module"
import { EstadoCuentaModule } from "@/components/modules/estado-cuenta-module"
import { UsuariosModule } from "@/components/modules/usuarios-module"
import { LoginModule } from "@/components/modules/login-module"

import { useParams, useRouter } from "next/navigation"

const titles: Record<ModuleId, string> = {
  dashboard: "Dashboard",
  clientes: "Clientes",
  catalogo: "Catálogo",
  ventas: "Ventas y Facturación",
  graficos: "Gráficos y Reportes",
  "estado-cuenta": "Finanzas y Caja",
  usuarios: "Usuarios",
}

export default function Page() {
  const params = useParams()
  const router = useRouter()
  
  const currentModule = (params.modulo?.[0] as ModuleId) || "dashboard"
  const isValidModule = Object.keys(titles).includes(currentModule)
  const active = isValidModule ? currentModule : "dashboard"
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      setIsAuthenticated(true)
    } else {
      setIsAuthenticated(false)
    }
  }, [])

  if (isAuthenticated === null) {
    return null // O un spinner de carga
  }

  if (!isAuthenticated) {
    return <LoginModule onLoginSuccess={() => setIsAuthenticated(true)} />
  }

  return (
    <AppShell 
      active={active} 
      onSelect={(id) => {
        if (id === "dashboard") {
          router.push("/")
        } else {
          router.push(`/${id}`)
        }
      }} 
      title={titles[active]}
      onLogout={() => {
        localStorage.removeItem("token")
        setIsAuthenticated(false)
      }}
    >
      {active === "dashboard" && <DashboardModule />}
      {active === "clientes" && <ClientesModule />}
      {active === "catalogo" && <CatalogoModule />}
      {active === "ventas" && <VentasModule />}
      {active === "graficos" && <GraficosModule />}
      {active === "estado-cuenta" && <EstadoCuentaModule />}
      {active === "usuarios" && <UsuariosModule />}
    </AppShell>
  )
}
