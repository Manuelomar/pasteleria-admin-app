"use client"

import { useState } from "react"
import {
  Users,
  BookOpen,
  ShoppingCart,
  BarChart3,
  Wallet,
  ShieldCheck,
  LayoutDashboard,
  Cake,
  Menu,
  Truck,
  FileText,
  Banknote,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { type Usuario, rolLabel } from "@/types"

export type ModuleId =
  | "dashboard"
  | "clientes"
  | "catalogo"
  | "ventas"
  | "cuentas-cobrar"
  | "estado-cuenta"
  | "usuarios"
  | "entregas"
  | "reportes"

interface NavItem {
  id: ModuleId
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const modulos: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "clientes", label: "Clientes", icon: Users },
  { id: "catalogo", label: "Catálogo", icon: BookOpen },
  { id: "entregas", label: "Entregas", icon: Truck },
  { id: "ventas", label: "Ventas", icon: ShoppingCart },
  { id: "cuentas-cobrar", label: "Cuentas por Cobrar", icon: Banknote },
  { id: "estado-cuenta", label: "Finanzas y Caja", icon: Wallet },
  { id: "reportes", label: "Reportes", icon: FileText },
]

const administracion: NavItem[] = [{ id: "usuarios", label: "Usuarios", icon: ShieldCheck }]

function NavSection({
  title,
  items,
  active,
  onSelect,
}: {
  title: string
  items: NavItem[]
  active: ModuleId
  onSelect: (id: ModuleId) => void
}) {
  return (
    <div className="flex flex-col gap-1">
      <p className="px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      {items.map((item) => {
        const Icon = item.icon
        const isActive = active === item.id
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-foreground/80 hover:bg-secondary hover:text-foreground",
            )}
          >
            <Icon className="size-4.5 shrink-0" />
            <span>{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}

function SidebarContent({
  active,
  onSelect,
  onLogout,
  currentUser,
}: {
  active: ModuleId
  onSelect: (id: ModuleId) => void
  onLogout?: () => void
  currentUser?: Usuario | null
}) {
  const isAdmin = currentUser?.rol === "admin"
  const isProveedor = currentUser?.rol === "proveedor"
  const permisos = currentUser?.permisos || {}

  const modulosVisibles = modulos
    .filter((m) => {
      if (isAdmin) return true;
      if (isProveedor && (m.id === 'catalogo' || m.id === 'entregas')) return true;
      return permisos[m.id] === true;
    })
    .map(m => {
      if (m.id === 'catalogo' && isProveedor) {
        return { ...m, label: 'Mis Productos' };
      }
      return m;
    })
  const administracionVisibles = administracion.filter((m) => isAdmin || permisos[m.id] === true)
  return (
    <div className="flex h-full flex-col p-4">
      <div className="flex items-center gap-3 px-2 py-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Cake className="size-5" />
        </div>
        <div className="flex flex-col">
          <span className="font-heading text-lg font-semibold leading-none text-foreground">
            Bizcochao
          </span>
          <span className="text-xs text-muted-foreground">Pastelería & Repostería</span>
        </div>
      </div>
      <nav className="mt-2 flex flex-1 flex-col gap-2">
        <NavSection title="Módulos" items={modulosVisibles} active={active} onSelect={onSelect} />
        {administracionVisibles.length > 0 && (
          <>
            <div className="my-1 h-px bg-border" />
            <NavSection
              title="Administración"
              items={administracionVisibles}
              active={active}
              onSelect={onSelect}
            />
          </>
        )}
      </nav>
      {onLogout && (
        <div className="mt-auto pt-4">
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground" onClick={onLogout}>
            <ShieldCheck className="mr-3 size-4.5" />
            Cerrar sesión
          </Button>
        </div>
      )}
    </div>
  )
}

export function AppShell({
  active,
  onSelect,
  title,
  children,
  onLogout,
  currentUser,
}: {
  active: ModuleId
  onSelect: (id: ModuleId) => void
  title: string
  children: React.ReactNode
  onLogout?: () => void
  currentUser?: Usuario | null
}) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleSelect = (id: ModuleId) => {
    onSelect(id)
    setMobileOpen(false)
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-border bg-sidebar lg:block">
        <SidebarContent active={active} onSelect={handleSelect} onLogout={onLogout} currentUser={currentUser} />
      </aside>

      <div className="flex flex-1 flex-col lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur md:px-6">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="size-5" />
                  <span className="sr-only">Abrir menú</span>
                </Button>
              }
            />
            <SheetContent side="left" className="w-72 bg-sidebar p-0">
              <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
              <SidebarContent active={active} onSelect={handleSelect} onLogout={onLogout} currentUser={currentUser} />
            </SheetContent>
          </Sheet>
          <h1 className="font-heading text-xl font-semibold text-foreground">{title}</h1>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium leading-none text-foreground">{currentUser?.nombre || "Usuario"}</p>
              <p className="text-xs text-muted-foreground">{currentUser ? rolLabel[currentUser.rol] : ""}</p>
            </div>
            <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold uppercase text-primary">
              {currentUser?.nombre?.substring(0, 2) || "U"}
            </div>
            {/* {onLogout && (
              <Button variant="ghost" size="sm" onClick={onLogout} className="ml-2 text-muted-foreground hover:text-foreground">
                Cerrar sesión
              </Button>
            )} */}
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
