"use client"

import { useState } from "react"
import { Lock, User } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { api } from "@/services"

export function LoginModule({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!username || !password) {
      toast.error("Por favor ingresa usuario y contraseña")
      return
    }

    setIsLoading(true)
    try {
      const response = await api.auth.login({ username, password })
      localStorage.setItem("token", response.access_token)
      toast.success("¡Bienvenido a Bizcochao!")
      onLoginSuccess()
    } catch (error) {
      console.error(error)
      toast.error("Credenciales incorrectas")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      
      <Card className="w-full max-w-md relative z-10 border-border/50 shadow-xl backdrop-blur-sm bg-card/80">
        <form onSubmit={handleSubmit}>
          <CardHeader className="space-y-3 pb-6 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <span className="font-heading text-3xl font-bold">B</span>
            </div>
            <div>
              <CardTitle className="font-heading text-2xl font-bold">Inicia sesión</CardTitle>
              <CardDescription className="mt-1">
                Ingresa tus credenciales para acceder a Bizcochao
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field>
              <FieldLabel htmlFor="username">Usuario</FieldLabel>
              <div className="relative">
                <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="username"
                  placeholder="ManuelOmar"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-9"
                  disabled={isLoading}
                  autoComplete="username"
                />
              </div>
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Contraseña</FieldLabel>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
              </div>
            </Field>
          </CardContent>
          <CardFooter className="pt-2 pb-6">
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? "Verificando..." : "Entrar"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
