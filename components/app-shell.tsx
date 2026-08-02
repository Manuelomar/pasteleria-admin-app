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
  Package,
  History,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { type Usuario, rolLabel } from "@/types"
import { ThemeToggle } from "@/components/theme-toggle"

export type ModuleId =
  | "dashboard"
  | "clientes"
  | "catalogo"
  | "ventas"
  | "cuentas-cobrar"
  | "estado-cuenta"
  | "usuarios"
  | "entregas"
  | "inventario"
  | "reportes"
  | "historial"
  | "solicitudes-bizcocho"
  | "solicitudes-combo"

interface NavItem {
  id: ModuleId
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const modulos: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "clientes", label: "Clientes", icon: Users },
  { id: "catalogo", label: "Catálogo", icon: BookOpen },
  { id: "inventario", label: "Inventario", icon: Package },
  { id: "entregas", label: "Entregas", icon: Truck },
  { id: "ventas", label: "Ventas", icon: ShoppingCart },
  { id: "cuentas-cobrar", label: "Cuentas por Cobrar", icon: Banknote },
  { id: "estado-cuenta", label: "Finanzas y Caja", icon: Wallet },
  { id: "historial", label: "Historial", icon: History },
  { id: "reportes", label: "Reportes", icon: FileText },
]

const solicitudes: NavItem[] = [
  { id: "solicitudes-bizcocho", label: "Bizcochos", icon: Cake },
  { id: "solicitudes-combo", label: "Combos", icon: Package },
]

const administracion: NavItem[] = [{ id: "usuarios", label: "Usuarios", icon: ShieldCheck }]

function NavGroupComponent({
  label,
  icon: Icon,
  items,
  active,
  onSelect,
  isCollapsed,
  onExpand,
}: {
  label: string
  icon: React.ComponentType<{ className?: string }>
  items: NavItem[]
  active: ModuleId
  onSelect: (id: ModuleId) => void
  isCollapsed?: boolean
  onExpand?: () => void
}) {
  const isActiveGroup = items.some((item) => item.id === active)
  const [isOpen, setIsOpen] = useState(isActiveGroup)

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={() => {
          if (isCollapsed && onExpand) {
            onExpand()
            setIsOpen(true)
          } else {
            setIsOpen(!isOpen)
          }
        }}
        title={isCollapsed ? label : undefined}
        className={cn(
          "flex items-center rounded-lg py-2.5 text-sm font-medium transition-colors",
          isCollapsed ? "justify-center px-0" : "justify-between px-3 gap-3",
          isActiveGroup
            ? "text-primary bg-primary/5 shadow-sm"
            : "text-foreground/80 hover:bg-secondary hover:text-foreground"
        )}
      >
        <div className={cn("flex items-center", isCollapsed ? "justify-center" : "gap-3")}>
          <Icon className="size-4.5 shrink-0" />
          {!isCollapsed && <span className="text-left leading-tight">{label}</span>}
        </div>
        {!isCollapsed && (isOpen ? (
          <ChevronDown className="size-4 opacity-50 transition-transform" />
        ) : (
          <ChevronRight className="size-4 opacity-50 transition-transform" />
        ))}
      </button>
      {isOpen && !isCollapsed && (
        <div className="ml-4 flex flex-col gap-1 border-l border-border/50 pl-2 mt-1">
          {items.map((item) => {
            const ItemIcon = item.icon
            const isActive = active === item.id
            return (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm font-medium"
                    : "text-foreground/70 hover:bg-secondary hover:text-foreground"
                )}
              >
                <ItemIcon className="size-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function NavItemComponent({
  item,
  active,
  onSelect,
  isCollapsed,
}: {
  item: NavItem
  active: ModuleId
  onSelect: (id: ModuleId) => void
  isCollapsed?: boolean
}) {
  const Icon = item.icon
  const isActive = active === item.id
  return (
    <button
      onClick={() => onSelect(item.id)}
      title={isCollapsed ? item.label : undefined}
      className={cn(
        "flex items-center rounded-lg py-2.5 text-sm font-medium transition-colors",
        isCollapsed ? "justify-center px-0" : "px-3 gap-3",
        isActive
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-foreground/80 hover:bg-secondary hover:text-foreground"
      )}
    >
      <Icon className="size-4.5 shrink-0" />
      {!isCollapsed && <span>{item.label}</span>}
    </button>
  )
}

function NavSection({
  title,
  items,
  active,
  onSelect,
  isCollapsed,
  onExpand,
}: {
  title: string
  items: NavItem[]
  active: ModuleId
  onSelect: (id: ModuleId) => void
  isCollapsed?: boolean
  onExpand?: () => void
}) {
  // Define groups dynamically based on available items
  const dashboardItem = items.find((i) => i.id === "dashboard")
  const ventasItem = items.find((i) => i.id === "ventas")
  
  const catalogItems = items.filter((i) => ["catalogo", "inventario"].includes(i.id))
  const clientsItems = items.filter((i) => ["clientes", "entregas"].includes(i.id))
  const financeItems = items.filter((i) => ["cuentas-cobrar", "estado-cuenta"].includes(i.id))
  const reportItems = items.filter((i) => ["historial", "reportes"].includes(i.id))

  return (
    <div className="flex flex-col gap-1">
      {!isCollapsed && (
        <p className="px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </p>
      )}
      
      {dashboardItem && (
        <NavItemComponent item={dashboardItem} active={active} onSelect={onSelect} isCollapsed={isCollapsed} />
      )}

      {ventasItem && (
        <NavItemComponent item={ventasItem} active={active} onSelect={onSelect} isCollapsed={isCollapsed} />
      )}

      {catalogItems.length > 1 ? (
        <NavGroupComponent
          label="Catálogo e Inventario"
          icon={Package}
          items={catalogItems}
          active={active}
          onSelect={onSelect}
          isCollapsed={isCollapsed}
          onExpand={onExpand}
        />
      ) : catalogItems.length === 1 && (
        <NavItemComponent item={catalogItems[0]} active={active} onSelect={onSelect} isCollapsed={isCollapsed} />
      )}

      {clientsItems.length > 1 ? (
        <NavGroupComponent
          label="Clientes y Entregas"
          icon={Users}
          items={clientsItems}
          active={active}
          onSelect={onSelect}
          isCollapsed={isCollapsed}
          onExpand={onExpand}
        />
      ) : clientsItems.length === 1 && (
        <NavItemComponent item={clientsItems[0]} active={active} onSelect={onSelect} isCollapsed={isCollapsed} />
      )}

      {financeItems.length > 1 ? (
        <NavGroupComponent
          label="Finanzas"
          icon={Wallet}
          items={financeItems}
          active={active}
          onSelect={onSelect}
          isCollapsed={isCollapsed}
          onExpand={onExpand}
        />
      ) : financeItems.length === 1 && (
        <NavItemComponent item={financeItems[0]} active={active} onSelect={onSelect} isCollapsed={isCollapsed} />
      )}

      {reportItems.length > 1 ? (
        <NavGroupComponent
          label="Reportes e Historial"
          icon={FileText}
          items={reportItems}
          active={active}
          onSelect={onSelect}
          isCollapsed={isCollapsed}
          onExpand={onExpand}
        />
      ) : reportItems.length === 1 && (
        <NavItemComponent item={reportItems[0]} active={active} onSelect={onSelect} isCollapsed={isCollapsed} />
      )}
      
      {/* Fallback for items that don't belong to any group and are not dashboard */}
      {items
        .filter(
          (i) =>
            i.id !== "dashboard" &&
            i.id !== "ventas" &&
            !catalogItems.includes(i) &&
            !clientsItems.includes(i) &&
            !financeItems.includes(i) &&
            !reportItems.includes(i)
        )
        .map((item) => (
          <NavItemComponent key={item.id} item={item} active={active} onSelect={onSelect} isCollapsed={isCollapsed} />
        ))}
    </div>
  )
}

function SidebarContent({
  active,
  onSelect,
  onLogout,
  currentUser,
  isCollapsed,
  onToggleCollapse,
}: {
  active: ModuleId
  onSelect: (id: ModuleId) => void
  onLogout?: () => void
  currentUser?: Usuario | null
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}) {
  const isAdmin = currentUser?.rol === "admin"
  const isProveedor = currentUser?.rol === "proveedor"
  const permisos = currentUser?.permisos || {}

  const modulosVisibles = modulos
    .filter((m) => {
      if (isAdmin) return true;
      if (isProveedor && (m.id === 'catalogo' || m.id === 'entregas' || m.id === 'reportes')) return true;
      return permisos[m.id] === true;
    })
    .map(m => {
      if (m.id === 'catalogo' && isProveedor) {
        return { ...m, label: 'Mis Productos' };
      }
      return m;
    })
  const administracionVisibles = administracion
    .filter((m) => {
      if (m.id === "usuarios") return true
      return isAdmin || permisos[m.id] === true
    })
    .map((m) => {
      if (m.id === "usuarios" && !isAdmin && permisos.usuarios !== true) {
        return { ...m, label: "Mi Perfil" }
      }
      return m
    })
    
  const solicitudesVisibles = solicitudes.filter(() => isAdmin)

  return (
    <div className="flex h-full flex-col p-4">
      <div className={cn("flex items-center py-3", isCollapsed ? "justify-center px-0" : "px-2 gap-3")}>
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Cake className="size-5" />
        </div>
        {!isCollapsed && (
          <div className="flex flex-col">
            <span className="font-heading text-lg font-semibold leading-none text-foreground">
              Bizcochao
            </span>
            <span className="text-xs text-muted-foreground">Pastelería & Repostería</span>
          </div>
        )}
      </div>
      <nav className="mt-2 flex flex-1 flex-col gap-2 overflow-y-auto min-h-0 pr-1">
        <NavSection title="Módulos" items={modulosVisibles} active={active} onSelect={onSelect} isCollapsed={isCollapsed} onExpand={() => onToggleCollapse?.()} />
        
        {solicitudesVisibles.length > 0 && (
          <>
            <div className="my-1 h-px bg-border" />
            <NavSection
              title="Solicitudes Web"
              items={solicitudesVisibles}
              active={active}
              onSelect={onSelect}
              isCollapsed={isCollapsed}
              onExpand={() => onToggleCollapse?.()}
            />
          </>
        )}

        {administracionVisibles.length > 0 && (
          <>
            <div className="my-1 h-px bg-border" />
            <NavSection
              title="Administración"
              items={administracionVisibles}
              active={active}
              onSelect={onSelect}
              isCollapsed={isCollapsed}
              onExpand={() => onToggleCollapse?.()}
            />
          </>
        )}
      </nav>
      
      <div className="mt-auto flex flex-col gap-2 pt-4">
        {onToggleCollapse && (
          <Button variant="ghost" className={cn("text-muted-foreground hover:text-foreground", isCollapsed ? "w-full justify-center px-0" : "w-full justify-start")} onClick={onToggleCollapse} title={isCollapsed ? "Expandir" : "Contraer menú"}>
            {isCollapsed ? <PanelLeftOpen className="size-4.5" /> : <PanelLeftClose className="mr-3 size-4.5" />}
            {!isCollapsed && "Contraer menú"}
          </Button>
        )}
        {onLogout && (
          <Button variant="ghost" className={cn("text-muted-foreground hover:text-foreground", isCollapsed ? "w-full justify-center px-0" : "w-full justify-start")} onClick={onLogout} title={isCollapsed ? "Cerrar sesión" : undefined}>
            <ShieldCheck className={cn("size-4.5", !isCollapsed && "mr-3")} />
            {!isCollapsed && "Cerrar sesión"}
          </Button>
        )}
      </div>
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
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleSelect = (id: ModuleId) => {
    onSelect(id)
    setMobileOpen(false)
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className={cn("fixed inset-y-0 left-0 hidden border-r border-border bg-sidebar lg:block transition-all duration-300", isCollapsed ? "w-20" : "w-64")}>
        <SidebarContent active={active} onSelect={handleSelect} onLogout={onLogout} currentUser={currentUser} isCollapsed={isCollapsed} onToggleCollapse={() => setIsCollapsed(!isCollapsed)} />
      </aside>

      <div className={cn("flex flex-1 flex-col transition-all duration-300", isCollapsed ? "lg:pl-20" : "lg:pl-64")}>
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
            <ThemeToggle />
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium leading-none text-foreground">{currentUser?.nombre || "Usuario"}</p>
              <p className="text-xs text-muted-foreground">{currentUser ? rolLabel[currentUser.rol] : ""}</p>
            </div>
            <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold uppercase text-primary">
              {currentUser?.nombre?.substring(0, 2) || "U"}
            </div>
          </div>
        </header>

        <main className="flex-1 min-w-0 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
