"use client"

import { useState, useEffect } from "react"
import { Search, Plus, MoreHorizontal, History, Pencil, Wallet, UserX } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ActivoBadge } from "@/components/badges"
import { ClienteDialog } from "@/components/dialogs/cliente-dialog"
import { currency, type Cliente } from "@/lib/data"
import { api } from "@/lib/api"

export function ClientesModule() {
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Cliente | null>(null)
  const [items, setItems] = useState<Cliente[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchClientes = () => {
    setIsLoading(true)
    api.clientes.getAll()
      .then((data) => setItems(data))
      .catch((err) => {
        console.error("Error fetching clientes", err)
        toast.error("Error de conexión al cargar clientes")
      })
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    fetchClientes()
  }, [])

  const filtered = items.filter((c) => {
    const q = search.toLowerCase()
    return (
      c.nombre.toLowerCase().includes(q) ||
      c.telefono.includes(q) ||
      c.correo.toLowerCase().includes(q)
    )
  })

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-muted-foreground">
        Administra la información de tus clientes y sus balances pendientes.
      </p>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, teléfono o correo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          onClick={() => {
            setEditing(null)
            setDialogOpen(true)
          }}
        >
          <Plus data-icon="inline-start" />
          Nuevo cliente
        </Button>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead>Dirección</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead>Última compra</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium text-foreground">{c.nombre}</TableCell>
                  <TableCell className="text-muted-foreground">{c.telefono}</TableCell>
                  <TableCell className="text-muted-foreground">{c.correo}</TableCell>
                  <TableCell className="max-w-[180px] truncate text-muted-foreground">
                    {c.direccion}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    <span className={c.balance > 0 ? "text-primary" : "text-foreground"}>
                      {currency(c.balance)}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{c.ultimaCompra}</TableCell>
                  <TableCell>
                    <ActivoBadge activo={c.activo} />
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="size-4" />
                            <span className="sr-only">Acciones</span>
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end">
                        <DropdownMenuGroup>
                          <DropdownMenuItem onClick={() => toast.info(`Historial de ${c.nombre}`)}>
                            <History className="size-4" />
                            Ver historial
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setEditing(c)
                              setDialogOpen(true)
                            }}
                          >
                            <Pencil className="size-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.info(`Estado de cuenta de ${c.nombre}`)}>
                            <Wallet className="size-4" />
                            Estado de cuenta
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.warning(`${c.nombre} desactivado`)}>
                            <UserX className="size-4" />
                            Desactivar
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No se encontraron clientes.
        </div>
      ) : null}

      <ClienteDialog open={dialogOpen} onOpenChange={setDialogOpen} cliente={editing} onSaved={fetchClientes} />
    </div>
  )
}
