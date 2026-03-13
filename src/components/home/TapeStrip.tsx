export function TapeStrip() {
    return (
        <div className="w-full overflow-hidden bg-foreground py-3 relative z-20 my-10" style={{ transform: 'rotate(-2deg) scale(1.05)' }}>
            <div className="flex " style={{ width: 'max-content' }}>
                <div
                    className="flex whitespace-nowrap animate-[marquee_20s_linear_infinite]"
                >
                    {/* Triplicamos el contenido para asegurar el loop suave */}
                    {[1, 2, 3].map((set) => (
                        <div key={set} className="flex items-center gap-6 pr-6">
                            <span className="font-heading text-lg text-background uppercase tracking-tight">
                                LA GUACA
                            </span>
                            <span className="font-heading text-lg text-background opacity-40">·</span>
                            <span className="font-heading text-lg text-background uppercase tracking-tight">
                                MONTERÍA
                            </span>
                            <span className="font-heading text-lg text-background opacity-40">·</span>
                            <span className="font-heading text-lg text-background uppercase tracking-tight">
                                STREETWEAR
                            </span>
                            <span className="font-heading text-lg text-background opacity-40">·</span>
                            <span className="font-heading text-lg text-background uppercase tracking-tight">
                                COLOMBIA
                            </span>
                            <span className="font-heading text-lg text-background opacity-40">·</span>
                        </div>
                    ))}
                    {[1, 2, 3].map((set) => (
                        <div key={`dup-${set}`} className="flex items-center gap-6 pr-6">
                            <span className="font-heading text-lg text-background uppercase tracking-tight">
                                LA GUACA
                            </span>
                            <span className="font-heading text-lg text-background opacity-40">·</span>
                            <span className="font-heading text-lg text-background uppercase tracking-tight">
                                MONTERÍA
                            </span>
                            <span className="font-heading text-lg text-background opacity-40">·</span>
                            <span className="font-heading text-lg text-background uppercase tracking-tight">
                                STREETWEAR
                            </span>
                            <span className="font-heading text-lg text-background opacity-40">·</span>
                            <span className="font-heading text-lg text-background uppercase tracking-tight">
                                COLOMBIA
                            </span>
                            <span className="font-heading text-lg text-background opacity-40">·</span>
                        </div>
                    ))}
                </div>
            </div>
            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
            `}</style>
        </div>
    )
}
