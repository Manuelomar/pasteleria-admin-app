import { ComboBuilder } from "@/components/combo-builder/ComboBuilder"
import { ThemeToggle } from '@/components/theme-toggle'
import { Metadata } from "next"

export const metadata: Metadata = {
  title: 'Personaliza tu Combo | Bizcochao',
  description: 'Arma tu combo con los productos de Bizcochao.',
}

export default function PersonalizaComboPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header público */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
          <a
            href="/menu"
            className="font-heading text-2xl font-bold text-primary transition-opacity hover:opacity-80"
          >
            Bizcochao
          </a>
          <div className="flex items-center gap-4">
            <a
              href="/menu"
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Ver menú
            </a>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main>
        <ComboBuilder />
      </main>

      <footer className="mt-12 border-t border-border py-6 text-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} Bizcochao. Todos los derechos reservados.</p>
      </footer>
    </div>
  )
}
