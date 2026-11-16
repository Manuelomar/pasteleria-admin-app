"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Usuario, Sucursal } from "@/types"
import Swal from "sweetalert2"
import { Eye, EyeOff, Sparkles, Copy, Check } from "lucide-react"

import { api } from "@/services"

export function UsuarioDialog({
  open,
  onOpenChange,
  usuario,
  onSaved,
  currentUser,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  usuario: Usuario | null
  onSaved?: () => void
  currentUser?: Usuario | null
}) {
  const isSuperAdmin = currentUser?.rol === "superadmin"
  const isAdminUser = isSuperAdmin || currentUser?.rol === "admin" || currentUser?.permisos?.usuarios === true
  const [nombre, setNombre] = useState("")
  const [correo, setCorreo] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [cambiarPassword, setCambiarPassword] = useState(false)
  const [rol, setRol] = useState("usuario")
  const [sucursalId, setSucursalId] = useState<string>("")
  const [sucursales, setSucursales] = useState<Sucursal[]>([])
  const [activo, setActivo] = useState(true)
  const [isProvider, setIsProvider] = useState(false)
  const defaultPermisos = {
    dashboard: true,
    clientes: true,
    catalogo: true,
    entregas: true,
    ventas: true,
    graficos: true,
    estadoCuenta: true,
    usuarios: false,
    inventario: false,
  }
  const [permisos, setPermisos] = useState<Record<string, boolean>>(defaultPermisos)
  const [isSaving, setIsSaving] = useState(false)
  const [copiedPassword, setCopiedPassword] = useState(false)

  const handleGenerarPassword = () => {
    const palabras = ["Dulce", "Bizcocho", "Pastel", "Canela", "Vainilla", "Fresa", "Glaseado"]
    const palabra = palabras[Math.floor(Math.random() * palabras.length)]
    const num = Math.floor(100 + Math.random() * 900)
    const simbolos = ["!", "@", "#", "$", "*"]
    const sim = simbolos[Math.floor(Math.random() * simbolos.length)]
    const generated = `${palabra}${num}${sim}`

    setPassword(generated)
    setConfirmPassword(generated)
    setShowPassword(true)
    setShowConfirmPassword(true)

    if (navigator?.clipboard) {
      navigator.clipboard.writeText(generated)
      setCopiedPassword(true)
      setTimeout(() => setCopiedPassword(false), 3000)
    }
  }

  const handleCopiarPassword = () => {
    if (!password || !navigator?.clipboard) return
    navigator.clipboard.writeText(password)
    setCopiedPassword(true)
    setTimeout(() => setCopiedPassword(false), 3000)
  }

  useEffect(() => {
    if (open) {
      api.sucursales.getAll().then(setSucursales).catch(console.error)
      setNombre(usuario?.nombre ?? "")
      setCorreo(usuario?.correo ?? "")
      setPassword("")
      setConfirmPassword("")
      setRol(usuario?.rol ?? "usuario")
      const defaultSucursal = usuario
        ? (usuario.sucursalId || "ninguna")
        : (isSuperAdmin ? "ninguna" : (currentUser?.sucursalId || "ninguna"))
      setSucursalId(defaultSucursal)
      setActivo(usuario?.activo ?? true)
      setIsProvider(usuario?.rol === "proveedor" || Boolean(usuario?.isProvider))
      setCambiarPassword(false)
      setPermisos(usuario?.permisos ? { ...defaultPermisos, ...usuario.permisos } : defaultPermisos)
    }
  }, [open, usuario, currentUser, isSuperAdmin])

  useEffect(() => {
    if (rol === "proveedor") {
      setIsProvider(true)
      setPermisos({
        dashboard: false,
        clientes: false,
        catalogo: true,
        entregas: true,
        ventas: false,
        graficos: false,
        estadoCuenta: false,
        usuarios: false,
        inventario: false,
      })
    } else if (rol === "vendedor") {
      setPermisos({
        dashboard: false,
        clientes: false,
        catalogo: true,
        entregas: false,
        ventas: true,
        graficos: false,
        estadoCuenta: false,
        usuarios: false,
        inventario: true,
      })
    }
  }, [rol])

  const handleSave = async () => {
    if (!nombre.trim()) {
      Swal.fire({
        icon: "error",
        title: "Error de validación",
        text: "El nombre es requerido",
        confirmButtonColor: "#e11d48"
      })
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!correo || !emailRegex.test(correo)) {
      Swal.fire({
        icon: "error",
        title: "Error de validación",
        text: "Por favor, introduce un correo electrónico válido (ej. usuario@ejemplo.com)",
        confirmButtonColor: "#e11d48"
      })
      return
    }

    if (!usuario && !password) {
      Swal.fire({
        icon: "error",
        title: "Error de validación",
        text: "La contraseña es requerida para nuevos usuarios",
        confirmButtonColor: "#e11d48"
      })
      return
    }

    if (password) {
      if (password !== confirmPassword) {
        Swal.fire({
          icon: "error",
          title: "Error de validación",
          text: "Las contraseñas no coinciden",
          confirmButtonColor: "#e11d48"
        })
        return
      }
      
      if (!/[A-Z]/.test(password)) {
        Swal.fire({
          icon: "error",
          title: "Error de validación",
          text: "La contraseña debe contener al menos una letra mayúscula",
          confirmButtonColor: "#e11d48"
        })
        return
      }
    }

    setIsSaving(true)
    try {
      const data: Partial<Usuario> & { password?: string } = {
        nombre,
        correo,
        username: correo, // username equals correo for now
      }
      
      if (isAdminUser) {
        data.rol = rol as Usuario["rol"]
        data.activo = activo
        data.isProvider = rol === "proveedor" ? true : isProvider
        data.permisos = permisos
        data.sucursalId = (!sucursalId || sucursalId === "ninguna") ? null : sucursalId
      }
      
      if (!usuario || cambiarPassword) {
        data.password = password
      }
      
      if (usuario) {
        await api.usuarios.update(usuario.id, data)
        Swal.fire({
          icon: "success",
          title: "Éxito",
          text: "Usuario actualizado",
          confirmButtonColor: "#e11d48"
        })
      } else {
        await api.usuarios.create(data)
        Swal.fire({
          icon: "success",
          title: "Éxito",
          text: "Usuario creado",
          confirmButtonColor: "#e11d48"
        })
      }
      
      if (onSaved) onSaved()
      onOpenChange(false)
    } catch (error: unknown) {
      console.error(error)
      const msg = error instanceof Error ? error.message : "Error al guardar el usuario"
      Swal.fire({
        icon: "error",
        title: "Error",
        text: msg,
        confirmButtonColor: "#e11d48"
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{usuario ? "Editar usuario" : "Nuevo usuario"}</DialogTitle>
          <DialogDescription>Datos de acceso al sistema.</DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="usr-nombre">Nombre</FieldLabel>
            <Input id="usr-nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </Field>
          <Field>
            <FieldLabel htmlFor="usr-mail">Correo</FieldLabel>
            <Input id="usr-mail" type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} />
          </Field>
          
          {usuario && (
            <div className="flex items-center space-x-2 py-2">
              <Switch id="cambiar-pass" checked={cambiarPassword} onCheckedChange={setCambiarPassword} />
              <label htmlFor="cambiar-pass" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                ¿Desea cambiar la contraseña?
              </label>
            </div>
          )}

          {(!usuario || cambiarPassword) && (
            <div className="space-y-4 rounded-lg border border-border/60 bg-muted/20 p-3.5 my-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {usuario ? "Nueva contraseña" : "Crear contraseña"}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerarPassword}
                  className="h-7 text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/5 hover:border-primary"
                >
                  <Sparkles className="size-3.5" />
                  Generar contraseña segura
                </Button>
              </div>

              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="usr-pass">
                    {usuario ? "Nueva Contraseña" : "Contraseña"}
                  </FieldLabel>
                  {password && (
                    <button
                      type="button"
                      onClick={handleCopiarPassword}
                      className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
                    >
                      {copiedPassword ? (
                        <>
                          <Check className="size-3 text-emerald-500" />
                          <span className="text-emerald-500">¡Copiada!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="size-3" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Input
                    id="usr-pass"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={usuario ? "Ingresa la nueva contraseña" : "••••••••"}
                    autoComplete="new-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Mínimo 6 caracteres y al menos una letra mayúscula.
                </p>
              </Field>

              <Field>
                <FieldLabel htmlFor="usr-pass-confirm">Confirmar Contraseña</FieldLabel>
                <div className="relative">
                  <Input
                    id="usr-pass-confirm"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite la contraseña"
                    autoComplete="new-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                    title={showConfirmPassword ? "Ocultar contraseña" : "Ver contraseña"}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </Field>
            </div>
          )}

          {isAdminUser && (
            <>
              <Field>
                <FieldLabel>Rol</FieldLabel>
                <Select value={rol} onValueChange={(val) => setRol(val ?? "")}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {isSuperAdmin && (
                      <SelectItem value="superadmin">Super Administrador (Global)</SelectItem>
                    )}
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="usuario">Usuario</SelectItem>
                    <SelectItem value="proveedor">Proveedor</SelectItem>
                    <SelectItem value="vendedor">Vendedor</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              {isSuperAdmin ? (
                <Field>
                  <FieldLabel>Sucursal Asignada</FieldLabel>
                  <Select 
                    value={sucursalId || "ninguna"} 
                    onValueChange={(val) => setSucursalId(val === "ninguna" ? "" : (val ?? ""))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar sucursal">
                        {sucursalId === "ninguna" || !sucursalId
                          ? "Sin sucursal (Super Admin / Global)"
                          : sucursales.find((s) => s.id === sucursalId)?.nombre || "Seleccionar sucursal"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ninguna">Sin sucursal (Super Admin / Global)</SelectItem>
                      {sucursales.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.nombre} ({s.codigo})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              ) : currentUser?.sucursalNombre ? (
                <Field>
                  <FieldLabel>Sucursal Asignada</FieldLabel>
                  <div className="text-sm font-medium py-2 px-3 bg-muted rounded-md text-muted-foreground">
                    {currentUser.sucursalNombre}
                  </div>
                </Field>
              ) : null}

              <Field orientation="horizontal" className="items-center justify-between">
                <FieldLabel htmlFor="usr-activo">Usuario activo</FieldLabel>
                <Switch id="usr-activo" checked={activo} onCheckedChange={setActivo} />
              </Field>

              {rol !== "proveedor" && (
                <Field orientation="horizontal" className="items-center justify-between pt-1">
                  <div className="space-y-0.5 pr-2">
                    <FieldLabel htmlFor="usr-es-proveedor">¿También actúa como proveedor?</FieldLabel>
                    <p className="text-xs text-muted-foreground">
                      Permite que este usuario aparezca en las listas de proveedores para suministrar productos a otras sucursales.
                    </p>
                  </div>
                  <Switch id="usr-es-proveedor" checked={isProvider} onCheckedChange={setIsProvider} />
                </Field>
              )}
            </>
          )}
        </FieldGroup>

        {/* Sección de Permisos - Ocultar si es superadmin o administrador ya que tienen todo */}
        {isAdminUser && rol !== "admin" && rol !== "superadmin" && (
          <div className="mt-6 flex flex-col gap-3">
            <h4 className="text-sm font-medium leading-none">Permisos de Módulos</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-lg border p-4">
              {Object.entries({
                dashboard: "Dashboard",
                clientes: "Clientes",
                catalogo: "Catálogo",
                entregas: "Entregas",
                ventas: "Ventas",
                graficos: "Gráficos",
                estadoCuenta: "Finanzas y Caja",
                usuarios: "Usuarios",
                inventario: "Inventario",
              }).map(([key, label]) => (
                <Field key={key} orientation="horizontal" className="items-center justify-between col-span-2 sm:col-span-1">
                  <FieldLabel htmlFor={`perm-${key}`} className="font-normal text-sm">{label}</FieldLabel>
                  <Switch 
                    id={`perm-${key}`} 
                    checked={permisos[key] ?? false} 
                    onCheckedChange={(checked) => setPermisos(p => ({ ...p, [key]: checked }))} 
                    disabled={rol === "proveedor" && key !== "catalogo" && key !== "entregas"}
                  />
                </Field>
              ))}
            </div>
          </div>
        )}

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
