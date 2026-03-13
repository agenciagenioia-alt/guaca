import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-6">
        <p className="font-mono text-[11px] tracking-[0.4em] text-foreground-muted uppercase">
          Error 404
        </p>
        <h1 className="text-3xl md:text-4xl font-heading font-bold uppercase tracking-tight text-foreground">
          Página no encontrada
        </h1>
        <p className="text-foreground-muted font-body">
          El enlace que seguiste no existe o fue movido.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-foreground text-background font-heading font-bold uppercase tracking-widest text-sm hover:opacity-90 transition-opacity"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
