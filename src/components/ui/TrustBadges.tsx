import { Shield, Truck, RotateCcw } from 'lucide-react'

export function TrustBadges() {
    const badges = [
        { icon: Shield, label: 'Pago Seguro' },
        { icon: Truck, label: 'Envíos Colombia' },
        { icon: RotateCcw, label: 'Cambios Fáciles' },
    ]

    return (
        <div className="flex items-center justify-center gap-6 py-4" role="list" aria-label="Garantías de compra">
            {badges.map((badge) => (
                <div
                    key={badge.label}
                    className="flex items-center gap-2 text-foreground-muted text-sm"
                    role="listitem"
                >
                    <badge.icon className="w-4 h-4 text-foreground" aria-hidden="true" />
                    <span>{badge.label}</span>
                </div>
            ))}
        </div>
    )
}
