interface SkeletonProps {
    className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
    return (
        <div
            className={`skeleton ${className}`}
            role="status"
            aria-label="Cargando contenido"
        >
            <span className="sr-only">Cargando...</span>
        </div>
    )
}

export function ProductCardSkeleton() {
    return (
        <div className="flex flex-col gap-3" role="status" aria-label="Cargando producto">
            <Skeleton className="w-full aspect-[4/5]" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-6 w-1/3" />
            <span className="sr-only">Cargando producto...</span>
        </div>
    )
}
