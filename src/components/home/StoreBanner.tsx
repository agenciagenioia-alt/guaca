'use client'

import Image from 'next/image'

const STORE_IMAGE_PLACEHOLDER =
  'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=1600'
const MAPS_URL =
  'https://www.google.com/maps/place/Boutique+La+Guaca/@8.765563,-75.8913527,17z/data=!3m1!4b1!4m6!3m5!1s0x8e5a2fa31ed2fe69:0x73d8ddf89702bd2f!8m2!3d8.7655577!4d-75.8864818!16s%2Fg%2F11h_6pp3x1?entry=ttu'

interface StoreBannerProps {
  videoUrl?: string | null
}

export function StoreBanner({ videoUrl }: StoreBannerProps) {
  return (
    <section
      className={`relative w-full h-[60vh] md:h-[85vh] overflow-hidden ${videoUrl ? 'bg-[#0a0800]' : ''}`}
      aria-label="Visítanos en Montería"
    >
      {/* Background: video or image — sin espacio arriba para evitar manchón blanco */}
      <div className="absolute inset-0 w-full h-full min-h-full">
        {videoUrl ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover object-center"
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
        ) : (
          <Image
            src={STORE_IMAGE_PLACEHOLDER}
            alt=""
            fill
            className="object-cover object-center"
            sizes="100vw"
            priority={false}
          />
        )}
        {/* Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(10,8,0,0.2) 0%, rgba(10,8,0,0.55) 100%)',
          }}
        />
      </div>

      {/* Centered content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
        <p
          className="text-[9px] md:text-[11px] font-mono tracking-[0.3em] md:tracking-[0.5em] mb-6"
          style={{ color: 'rgba(232,230,225,0.7)' }}
        >
          TU ESTILO. TU IDENTIDAD. TU CULTURA.
        </p>

        <h2
          className="font-display leading-none tracking-[0.05em] text-[clamp(36px,10vw,56px)] md:text-[clamp(48px,7vw,96px)]"
          style={{ color: '#E8E6E1' }}
        >
          VISÍTANOS EN MONTERÍA
        </h2>

        <p
          className="hidden md:block mt-3 text-sm"
          style={{
            color: 'rgba(232,230,225,0.6)',
            letterSpacing: '0.2em',
          }}
        >
          Calle 37 #1w-139 · Barrio Juan XXIII
        </p>

        <a
          href={MAPS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 md:mt-[32px] px-10 py-3.5 text-xs tracking-[0.3em] rounded-none transition-all duration-300 border border-[rgba(232,230,225,0.6)] text-[#E8E6E1] bg-transparent hover:bg-[rgba(232,230,225,0.1)] hover:border-[#E8E6E1]"
        >
          VER UBICACIÓN →
        </a>
      </div>
    </section>
  )
}
