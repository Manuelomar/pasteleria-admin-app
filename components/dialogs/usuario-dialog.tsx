"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
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
import type { Usuario } from "@/lib/data"

import { api } from "@/lib/api"

export function UsuarioDialog({
  open,
  onOpenChange,
  usuario,
  onSaved,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  usuario: Usuario | null
  onSaved?: () => void
}) {
  const [nombre, setNombre] = useState("")
  const [correo, setCorreo] = useState("")
  const [password, setPassword] = useState("")
  const [rol, setRol] = useState("cajero")
  const [activo, setActivo] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setNombre(usuario?.nombre ?? "")
      setCorreo(usuario?.correo ?? "")
      setPassword("")
      setRol(usuario?.rol ?? "cajero")
      setActivo(usuario?.activo ?? true)
    }
  }, [open, usuario])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const data: any = {
        nombre,
        correo,
        rol,
        activo,
        username: correo, // username equals correo for now
      }
      if (password) data.password = password
      
      if (usuario) {
        await api.usuarios.update(usuario.id, data)
        toast.success("Usuario actualizado")
      } else {
        if (!password) {
          toast.error("La contraseña es requerida para nuevos usuarios")
          setIsSaving(false)
          return
        }
        await api.usuarios.create(data)
        toast.success("Usuario creado")
      }
      
      if (onSaved) onSaved()
      onOpenChange(false)
    } catch (error) {
      console.error(error)
      toast.error("Error al guardar el usuario")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
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
          <Field>
            <FieldLabel htmlFor="usr-pass">Contraseña</FieldLabel>
            <Input
              id="usr-pass"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={usuario ? "Dejar en blanco para mantener" : "••••••••"}
            />
          </Field>
          <Field>
            <FieldLabel>Rol</FieldLabel>
            <Select value={rol} onValueChange={(val) => setRol(val ?? "")}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="administrador">Administrador</SelectItem>
                <SelectItem value="cajero">Cajero</SelectItem>
                <SelectItem value="vendedor">Vendedor</SelectItem>
                <SelectItem value="supervisor">Supervisor</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field orientation="horizontal" className="items-center justify-between">
            <FieldLabel htmlFor="usr-activo">Usuario activo</FieldLabel>
            <Switch id="usr-activo" checked={activo} onCheckedChange={setActivo} />
          </Field>
        </FieldGroup>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
