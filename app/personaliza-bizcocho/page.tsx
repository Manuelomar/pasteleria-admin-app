import type { Metadata } from 'next'
import { CakeBuilder } from '@/components/cake-builder/CakeBuilder'

export const metadata: Metadata = {
  title: 'Personaliza tu Bizcocho | Bizcochao',
  description:
    'Arma tu bizcocho ideal eligiendo sabor, relleno, cobertura, colores y decoración. Visualiza el resultado en tiempo real.',
}

export default function PersonalizaBizcochoPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header público */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
          <a
            href="/"
            className="font-heading text-2xl font-bold text-primary transition-opacity hover:opacity-80"
          >
            Bizcochao
          </a>
          <a
            href="/menu"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Ver menú
          </a>
        </div>
      </header>

      <main>
        <CakeBuilder />
      </main>

      <footer className="mt-12 border-t border-border py-6 text-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} Bizcochao. Todos los derechos reservados.</p>
      </footer>
    </div>
  )
}
