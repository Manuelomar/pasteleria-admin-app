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
import type { Usuario } from "@/types"
import Swal from "sweetalert2"
import { Eye, EyeOff } from "lucide-react"

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
  const isAdminUser = currentUser?.rol === "admin" || currentUser?.permisos?.usuarios === true
  const [nombre, setNombre] = useState("")
  const [correo, setCorreo] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [cambiarPassword, setCambiarPassword] = useState(false)
  const [rol, setRol] = useState("usuario")
  const [activo, setActivo] = useState(true)
  const defaultPermisos = {
    dashboard: true,
    clientes: true,
    catalogo: true,
    entregas: true,
    ventas: true,
    graficos: true,
    estadoCuenta: true,
    usuarios: false,
  }
  const [permisos, setPermisos] = useState<Record<string, boolean>>(defaultPermisos)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setNombre(usuario?.nombre ?? "")
      setCorreo(usuario?.correo ?? "")
      setPassword("")
      setConfirmPassword("")
      setRol(usuario?.rol ?? "usuario")
      setActivo(usuario?.activo ?? true)
      setCambiarPassword(false)
      setPermisos(usuario?.permisos ? { ...defaultPermisos, ...usuario.permisos } : defaultPermisos)
    }
  }, [open, usuario])

  useEffect(() => {
    if (rol === "proveedor") {
      setPermisos({
        dashboard: false,
        clientes: false,
        catalogo: true,
        entregas: true,
        ventas: false,
        graficos: false,
        estadoCuenta: false,
        usuarios: false,
      })
    }
  }, [rol])

  const handleSave = async () => {
    if (!nombre.trim()) {
      Swal.fire({
        icon: "error",
        title: "Error de validación",
        text: "El nombre es requerido",
        confirmButtonColor: "hsl(var(--primary))"
      })
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!correo || !emailRegex.test(correo)) {
      Swal.fire({
        icon: "error",
        title: "Error de validación",
        text: "Por favor, introduce un correo electrónico válido (ej. usuario@ejemplo.com)",
        confirmButtonColor: "hsl(var(--primary))"
      })
      return
    }

    if (!usuario && !password) {
      Swal.fire({
        icon: "error",
        title: "Error de validación",
        text: "La contraseña es requerida para nuevos usuarios",
        confirmButtonColor: "hsl(var(--primary))"
      })
      return
    }

    if (password) {
      if (password !== confirmPassword) {
        Swal.fire({
          icon: "error",
          title: "Error de validación",
          text: "Las contraseñas no coinciden",
          confirmButtonColor: "hsl(var(--primary))"
        })
        return
      }
      
      if (!/[A-Z]/.test(password)) {
        Swal.fire({
          icon: "error",
          title: "Error de validación",
          text: "La contraseña debe contener al menos una letra mayúscula",
          confirmButtonColor: "hsl(var(--primary))"
        })
        return
      }
    }

    setIsSaving(true)
    try {
      const data: any = {
        nombre,
        correo,
        username: correo, // username equals correo for now
      }
      
      if (isAdminUser) {
        data.rol = rol
        data.activo = activo
        data.permisos = permisos
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
          confirmButtonColor: "hsl(var(--primary))"
        })
      } else {
        await api.usuarios.create(data)
        Swal.fire({
          icon: "success",
          title: "Éxito",
          text: "Usuario creado",
          confirmButtonColor: "hsl(var(--primary))"
        })
      }
      
      if (onSaved) onSaved()
      onOpenChange(false)
    } catch (error: any) {
      console.error(error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Error al guardar el usuario",
        confirmButtonColor: "hsl(var(--primary))"
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
            <>
              <Field>
                <FieldLabel htmlFor="usr-pass">Contraseña</FieldLabel>
                <div className="relative">
                  <Input
                    id="usr-pass"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={usuario ? "Dejar en blanco para mantener" : "••••••••"}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
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
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </Field>
            </>
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
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="usuario">Usuario</SelectItem>
                    <SelectItem value="proveedor">Proveedor</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field orientation="horizontal" className="items-center justify-between">
                <FieldLabel htmlFor="usr-activo">Usuario activo</FieldLabel>
                <Switch id="usr-activo" checked={activo} onCheckedChange={setActivo} />
              </Field>
            </>
          )}
        </FieldGroup>

        {/* Sección de Permisos - Ocultar si es administrador ya que tiene todo por defecto */}
        {isAdminUser && rol !== "admin" && (
          <div className="mt-6 flex flex-col gap-3">
            <h4 className="text-sm font-medium leading-none">Permisos de Módulos</h4>
            <div className="grid grid-cols-2 gap-4 rounded-lg border p-4">
              {Object.entries({
                dashboard: "Dashboard",
                clientes: "Clientes",
                catalogo: "Catálogo",
                entregas: "Entregas",
                ventas: "Ventas",
                graficos: "Gráficos",
                estadoCuenta: "Finanzas y Caja",
                usuarios: "Usuarios",
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
