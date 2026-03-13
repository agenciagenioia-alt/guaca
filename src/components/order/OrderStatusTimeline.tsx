'use client'

const STEPS = [
  { key: 'pendiente', label: 'Recibido' },
  { key: 'confirmado', label: 'Confirmado' },
  { key: 'preparando', label: 'Preparando' },
  { key: 'enviado', label: 'Enviado' },
  { key: 'entregado', label: 'Entregado' },
] as const

const statusOrder: Record<string, number> = {
  pendiente: 0,
  confirmado: 1,
  preparando: 2,
  enviado: 3,
  entregado: 4,
  cancelado: -1,
}

interface OrderStatusTimelineProps {
  status: string
  className?: string
}

export function OrderStatusTimeline({ status, className = '' }: OrderStatusTimelineProps) {
  const currentIndex = statusOrder[status?.toLowerCase()] ?? 0
  const isCanceled = status?.toLowerCase() === 'cancelado'

  if (isCanceled) {
    return (
      <div className={`flex items-center gap-2 py-3 ${className}`}>
        <span className="w-3 h-3 rounded-full bg-error shrink-0" />
        <span className="text-sm font-medium text-error">Pedido cancelado</span>
      </div>
    )
  }

  return (
    <div className={`py-4 ${className}`}>
      <div className="flex items-center justify-between gap-1">
        {STEPS.map((step, index) => {
          const isCompleted = index <= currentIndex
          const isCurrent = index === currentIndex
          return (
            <div key={step.key} className="flex flex-1 flex-col items-center">
              <div className="flex w-full items-center">
                {index > 0 && (
                  <div
                    className={`h-0.5 flex-1 ${
                      index <= currentIndex ? 'bg-foreground' : 'bg-border'
                    }`}
                  />
                )}
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-none border-2 text-xs font-bold transition-colors ${
                    isCompleted
                      ? 'border-border-hover bg-foreground text-background'
                      : 'border-border bg-transparent text-foreground-muted'
                  } ${isCurrent ? 'ring-1 ring-border-hover ring-offset-2 ring-offset-background' : ''}`}
                >
                  {isCompleted ? '✓' : index + 1}
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 ${
                      index < currentIndex ? 'bg-foreground' : 'bg-border'
                    }`}
                  />
                )}
              </div>
              <span
                className={`mt-2 text-[10px] font-medium uppercase tracking-wider ${
                  isCompleted ? 'text-foreground' : 'text-foreground-muted'
                }`}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
