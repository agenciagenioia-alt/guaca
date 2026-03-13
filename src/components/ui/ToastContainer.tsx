'use client'

import { useToastStore } from '@/store/toast'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'

const icons = {
    success: CheckCircle,
    error: XCircle,
    info: Info,
}

const colors = {
    success: 'border-success text-success',
    error: 'border-error text-error',
    info: 'border-info text-info',
}

export function ToastContainer() {
    const { toasts, removeToast } = useToastStore()

    return (
        <div
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-sm px-4"
            role="region"
            aria-label="Notificaciones"
            aria-live="polite"
        >
            <AnimatePresence mode="sync">
                {toasts.map((toast) => {
                    const Icon = icons[toast.type]
                    return (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, y: 40, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                            className={`flex items-center gap-3 px-4 py-3 bg-surface border ${colors[toast.type]} rounded-lg shadow-modal`}
                            role="alert"
                        >
                            <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
                            <p className="text-sm text-foreground flex-1">{toast.message}</p>
                            <button
                                onClick={() => removeToast(toast.id)}
                                className="p-1 text-foreground-muted hover:text-foreground transition-colors"
                                aria-label="Cerrar notificación"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </motion.div>
                    )
                })}
            </AnimatePresence>
        </div>
    )
}
