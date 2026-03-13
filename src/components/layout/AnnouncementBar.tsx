interface AnnouncementBarProps {
    text: string
    isActive: boolean
}

export function AnnouncementBar({ text, isActive }: AnnouncementBarProps) {
    if (!isActive || !text) return null

    return (
        <div
            className="bg-surface border-b border-border text-foreground-muted text-[10px] tracking-[0.4em] text-center font-medium py-2 px-4 uppercase"
            role="banner"
            aria-label="Anuncio de la tienda"
        >
            <p className="max-w-7xl mx-auto">{text}</p>
        </div>
    )
}
