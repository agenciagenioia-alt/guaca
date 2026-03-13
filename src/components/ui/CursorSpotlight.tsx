'use client'
import { useEffect, useRef } from 'react'

export function CursorSpotlight() {
  const spotlightRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!window.matchMedia('(hover: hover)').matches) return

    const el = spotlightRef.current
    if (!el) return

    const handleMouseMove = (e: MouseEvent) => {
      el.style.background = `radial-gradient(
        500px circle at ${e.clientX}px ${e.clientY}px,
        rgba(232, 230, 225, 0.04),
        rgba(232, 230, 225, 0.015) 35%,
        transparent 70%
      )`
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  if (typeof window !== 'undefined' && !window.matchMedia('(hover: hover)').matches) {
    return (
      <div
        className="pointer-events-none fixed inset-0 z-[2] hero-static-glow"
      />
    )
  }

  return (
    <div
      ref={spotlightRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 2,
        transition: 'none',
      }}
    />
  )
}
