"use client"

import { useState, useEffect } from "react"
import { AppShell, type ModuleId } from "@/components/app-shell"
import { LoginModule } from "@/components/modules/login-module"
import { api } from "@/services"
import type { Usuario } from "@/types"
import { Loader } from "@/components/ui/loader"
import { usePathname, useRouter } from "next/navigation"

const titles: Record<ModuleId, string> = {
  dashboard: "Dashboard",
  clientes: "Clientes",
  catalogo: "Catálogo",
  ventas: "Ventas y Facturación",
  "cuentas-cobrar": "Cuentas por Cobrar",
  "estado-cuenta": "Finanzas y Caja",
  usuarios: "Usuarios",
  entregas: "Entregas de Proveedores",
  reportes: "Reportes",
}

export default function ModuloLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  
  const currentModule = (pathname.split('/')[1] || "dashboard") as ModuleId
  const isValidModule = Object.keys(titles).includes(currentModule)
  const active = isValidModule ? currentModule : "dashboard"

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null)

  const checkAuth = async () => {
    const token = localStorage.getItem("token")
    if (token) {
      try {
        const user = await api.auth.getMe()
        setCurrentUser(user)
        setIsAuthenticated(true)
        
        // Si es proveedor y está intentando entrar al dashboard, redirigir a entregas
        if (user.rol === "proveedor" && (pathname === "/" || pathname === "")) {
          router.push("/entregas")
        }
      } catch (err) {
        localStorage.removeItem("token")
        setIsAuthenticated(false)
        router.push("/")
      }
    } else {
      setIsAuthenticated(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  if (isAuthenticated === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginModule onLoginSuccess={checkAuth} />
  }

  const hasPermission = (moduloId: string) => {
    if (currentUser?.rol === "admin") return true
    if (currentUser?.rol === "proveedor" && (moduloId === "catalogo" || moduloId === "entregas")) return true
    return currentUser?.permisos?.[moduloId] === true
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
        setCurrentUser(null)
        setIsAuthenticated(false)
        router.push("/")
      }}
      currentUser={currentUser}
    >
      {!hasPermission(active) ? (
        <div className="flex h-[50vh] flex-col items-center justify-center text-center">
          <h2 className="text-2xl font-bold tracking-tight">Acceso Denegado</h2>
          <p className="text-muted-foreground mt-2">No tienes permiso para ver esta sección.</p>
        </div>
      ) : (
        children
      )}
    </AppShell>
  )
}
