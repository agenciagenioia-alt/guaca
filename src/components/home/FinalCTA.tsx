import Link from 'next/link'

export function FinalCTA() {
    return (
        <section className="w-full relative bg-transparent py-24 md:py-32 flex flex-col items-center justify-center text-center overflow-hidden">

            {/* Decoración Top Line */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-border to-transparent opacity-50" />

            <div className="max-w-[1400px] mx-auto px-6 relative z-10 flex flex-col items-center">

                {/* Títulos colosales interactivos */}
                <h2
                    className="font-heading text-[clamp(48px,8vw,120px)] leading-none text-transparent m-0 uppercase tracking-tight"
                    style={{ WebkitTextStroke: '1.5px var(--color-foreground)' }}
                >
                    ¿LISTO PARA
                </h2>
                <h2 className="font-heading text-[clamp(48px,8vw,120px)] leading-[0.85] text-foreground m-0 uppercase tracking-tight md:-mt-2">
                    LLEVAR LA GUACA?
                </h2>

                <p className="text-foreground-muted text-[13px] font-mono tracking-[0.3em] uppercase mt-8 md:mt-10 mb-12">
                    Envíos a toda Colombia <span className="mx-2 text-foreground">·</span> Pago seguro <span className="mx-2 text-foreground">·</span> Originales
                </p>

                {/* Botones de acción */}
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto px-6 sm:px-0">
                    <Link
                        href="/catalogo"
                        className="w-full sm:w-auto bg-foreground text-background font-heading font-bold tracking-widest uppercase px-12 py-5 text-lg hover:bg-black transition-colors text-center rounded-none"
                    >
                        VER CATÁLOGO
                    </Link>

                    <a
                        href="https://wa.me/573001234567" // Placeholder genérico, dueño personaliza en admin/settings DB idealmente
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto bg-transparent border border-border text-foreground font-heading font-bold tracking-widest uppercase px-12 py-5 text-lg hover:border-foreground hover:bg-transparent transition-colors text-center rounded-none"
                    >
                        ESCRÍBENOS
                    </a>
                </div>

            </div>

            {/* Decoración Bottom Line */}
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-border to-transparent opacity-50" />

        </section>
    )
}
