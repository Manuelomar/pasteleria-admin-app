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
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import type { Cliente } from "@/lib/data"

import { api } from "@/lib/api"

export function ClienteDialog({
  open,
  onOpenChange,
  cliente,
  onSaved,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  cliente: Cliente | null
  onSaved?: () => void
}) {
  const [nombre, setNombre] = useState("")
  const [telefono, setTelefono] = useState("")
  const [correo, setCorreo] = useState("")
  const [direccion, setDireccion] = useState("")
  const [nota, setNota] = useState("")
  const [activo, setActivo] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setNombre(cliente?.nombre ?? "")
      setTelefono(cliente?.telefono ?? "")
      setCorreo(cliente?.correo ?? "")
      setDireccion(cliente?.direccion ?? "")
      setNota(cliente?.nota ?? "")
      setActivo(cliente?.activo ?? true)
    }
  }, [open, cliente])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const data = {
        nombre,
        telefono,
        correo,
        direccion,
        nota,
        activo,
      }
      
      if (cliente) {
        await api.clientes.update(cliente.id, data)
        toast.success("Cliente actualizado")
      } else {
        await api.clientes.create(data)
        toast.success("Cliente registrado")
      }
      
      if (onSaved) onSaved()
      onOpenChange(false)
    } catch (error) {
      console.error(error)
      toast.error("Error al guardar el cliente")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{cliente ? "Editar cliente" : "Nuevo cliente"}</DialogTitle>
          <DialogDescription>Datos de contacto del cliente.</DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="cli-nombre">Nombre completo</FieldLabel>
            <Input id="cli-nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="cli-tel">Teléfono</FieldLabel>
              <Input id="cli-tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
            </Field>
            <Field>
              <FieldLabel htmlFor="cli-mail">Correo</FieldLabel>
              <Input id="cli-mail" type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} />
            </Field>
          </div>
          <Field>
            <FieldLabel htmlFor="cli-dir">Dirección</FieldLabel>
            <Input id="cli-dir" value={direccion} onChange={(e) => setDireccion(e.target.value)} />
          </Field>
          <Field>
            <FieldLabel htmlFor="cli-nota">Nota interna</FieldLabel>
            <Textarea id="cli-nota" value={nota} onChange={(e) => setNota(e.target.value)} />
          </Field>
          <Field orientation="horizontal" className="items-center justify-between">
            <FieldLabel htmlFor="cli-activo">Cliente activo</FieldLabel>
            <Switch id="cli-activo" checked={activo} onCheckedChange={setActivo} />
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
