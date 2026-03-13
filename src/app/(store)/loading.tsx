export default function StoreLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
        <p className="text-sm text-foreground-muted font-medium">Cargando...</p>
      </div>
    </div>
  )
}
