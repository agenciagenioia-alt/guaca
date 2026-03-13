'use client'

import { useEffect, useRef, useState } from 'react'

type CursorMode = 'default' | 'hover' | 'click'

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const pos = useRef({ x: -100, y: -100 })
  const smoothPos = useRef({ x: -100, y: -100 })
  const [mode, setMode] = useState<CursorMode>('default')
  const [hidden, setHidden] = useState(false)
  const [label, setLabel] = useState('')
  const [colorTheme, setColorTheme] = useState<'light' | 'dark'>('dark')
  const animId = useRef(0)

  useEffect(() => {
    if (window.matchMedia('(hover: none)').matches) return

    const detectTheme = () => {
      if (cursorRef.current) cursorRef.current.style.display = 'none'
      const el = document.elementFromPoint(pos.current.x, pos.current.y)
      if (cursorRef.current) cursorRef.current.style.display = 'block'
      if (!el) return

      let node: Element | null = el
      while (node) {
        const bg = window.getComputedStyle(node).backgroundColor
        const match = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d.]+)?/)
        if (match) {
          const alpha = match[4] !== undefined ? parseFloat(match[4]) : 1
          if (alpha < 0.05) {
            node = node.parentElement
            continue
          }
          const r = parseInt(match[1], 10)
          const g = parseInt(match[2], 10)
          const b = parseInt(match[3], 10)
          const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
          setColorTheme(lum > 0.45 ? 'light' : 'dark')
          return
        }
        node = node.parentElement
      }

      const bodyBg = window.getComputedStyle(document.body).backgroundColor
      const m = bodyBg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
      if (m) {
        const lum = (0.299 * parseInt(m[1], 10) + 0.587 * parseInt(m[2], 10) + 0.114 * parseInt(m[3], 10)) / 255
        setColorTheme(lum > 0.45 ? 'light' : 'dark')
      }
    }

    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY }
      detectTheme()
    }

    const onLeave = () => setHidden(true)
    const onEnter = () => setHidden(false)
    const onDown = () => setMode('click')
    const onUp = () => setMode('default')

    const bindHoverables = () => {
      document.querySelectorAll('a, button, [role="button"]').forEach((el) => {
        el.addEventListener('mouseenter', () => {
          setMode('hover')
          const text =
            (el as HTMLElement).getAttribute('data-cursor-label') ||
            (el as HTMLElement).textContent?.trim().slice(0, 24) ||
            ''
          setLabel(text)
        })
        el.addEventListener('mouseleave', () => {
          setMode('default')
          setLabel('')
        })
      })
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseleave', onLeave)
    window.addEventListener('mouseenter', onEnter)
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)
    bindHoverables()

    const observer = new MutationObserver(bindHoverables)
    observer.observe(document.body, { childList: true, subtree: true })

    const animate = () => {
      const el = cursorRef.current
      if (!el) {
        animId.current = requestAnimationFrame(animate)
        return
      }
      const lerp = 0.12
      smoothPos.current.x += (pos.current.x - smoothPos.current.x) * lerp
      smoothPos.current.y += (pos.current.y - smoothPos.current.y) * lerp
      el.style.transform = `translate(${smoothPos.current.x}px, ${smoothPos.current.y}px)`
      animId.current = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(animId.current)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseleave', onLeave)
      window.removeEventListener('mouseenter', onEnter)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
      observer.disconnect()
    }
  }, [])

  if (typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches) {
    return null
  }

  const size = mode === 'hover' ? 32 : mode === 'click' ? 20 : 24
  const gap = 6
  const stroke = 1.5
  const strokeColor =
    colorTheme === 'light'
      ? 'rgba(10,9,7,0.85)'
      : 'rgba(232,230,225,0.9)'
  const strokeTransition = 'background-color 400ms ease, color 400ms ease'

  return (
    <div
      ref={cursorRef}
      aria-hidden
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 1,
        height: 1,
        zIndex: 99999,
        pointerEvents: 'none',
        opacity: hidden ? 0 : 1,
        transition: 'opacity 150ms ease-out',
        filter: 'drop-shadow(0 0 1px rgba(0,0,0,0.8)) drop-shadow(0 0 3px rgba(0,0,0,0.4))',
      }}
    >
      {/* Crosshair: líneas horizontal y vertical */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: size * 2 + gap * 2,
          height: size * 2 + gap * 2,
          marginLeft: -(size + gap),
          marginTop: -(size + gap),
          transition: 'width 200ms cubic-bezier(0.16,1,0.3,1), height 200ms cubic-bezier(0.16,1,0.3,1), filter 300ms ease',
        }}
      >
        {/* Línea horizontal */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: '50%',
            width: '100%',
            height: stroke,
            marginTop: -stroke / 2,
            backgroundColor: strokeColor,
            borderRadius: 1,
            transition: strokeTransition,
          }}
        />
        {/* Línea vertical */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: 0,
            width: stroke,
            height: '100%',
            marginLeft: -stroke / 2,
            backgroundColor: strokeColor,
            borderRadius: 1,
            transition: strokeTransition,
          }}
        />
        {/* Centro: "LG" en default, círculo en hover/click */}
        {mode === 'default' ? (
          <span
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              fontFamily: 'var(--font-display), "Bebas Neue", system-ui, sans-serif',
              fontSize: 7,
              fontWeight: 400,
              letterSpacing: '0.02em',
              color: strokeColor,
              transition: strokeTransition,
              pointerEvents: 'none',
              lineHeight: 1,
            }}
          >
            LG
          </span>
        ) : (
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 4,
              height: 4,
              marginLeft: -2,
              marginTop: -2,
              borderRadius: '50%',
              backgroundColor: strokeColor,
              transform: mode === 'click' ? 'scale(0.6)' : 'scale(1)',
              transition: `transform 80ms ease-out, ${strokeTransition}`,
            }}
          />
        )}
      </div>

      {/* Label en hover */}
      {label && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            marginLeft: size + gap + 12,
            marginTop: -10,
            padding: '4px 10px',
            fontFamily: 'var(--font-heading), system-ui, sans-serif',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#E8E6E1',
            backgroundColor: 'rgba(17,17,16,0.88)',
            border: '1px solid rgba(232,230,225,0.2)',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            animation: 'cursorLabelIn 180ms ease-out',
          }}
        >
          {label}
        </div>
      )}
    </div>
  )
}
