'use client'

interface MoneriaMarqueeProps {
  dropLabel?: string
}

export function MoneriaMarquee({ dropLabel = 'DROP 001' }: MoneriaMarqueeProps) {
  const text = `MONERÍA STUDIO · DESIGN COUTURE · HECHO EN COLOMBIA · ${dropLabel} ·`

  return (
    <div
      className="relative w-full overflow-hidden flex items-center"
      style={{ height: 32, background: '#A69256' }}
    >
      <div className="animate-[marquee_22s_linear_infinite] whitespace-nowrap flex items-center">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            aria-hidden={i > 0 ? true : undefined}
            style={{
              fontFamily: 'var(--font-jetbrains-mono, monospace)',
              fontSize: 11,
              letterSpacing: '0.15em',
              color: '#0D0D0D',
              fontWeight: 600,
              textTransform: 'uppercase',
              paddingLeft: 32,
              paddingRight: 32,
            }}
          >
            {text}
          </span>
        ))}
      </div>
    </div>
  )
}
