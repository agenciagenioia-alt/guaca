'use client'

import { useState, useEffect } from 'react'

const MIN_VIEWERS = 5
const MAX_VIEWERS = 28
const UPDATE_INTERVAL_MS = 12_000

function randomCount() {
  return Math.floor(Math.random() * (MAX_VIEWERS - MIN_VIEWERS + 1)) + MIN_VIEWERS
}

export function ProductViewerCount() {
  const [count, setCount] = useState(() => randomCount())

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(randomCount())
    }, UPDATE_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [])

  return (
    <p className="flex items-center gap-2 text-[13px] text-foreground-muted font-medium tracking-wide">
      <span aria-hidden="true" className="opacity-70">👁</span>
      <span>
        {count} {count === 1 ? 'persona está' : 'personas están'} viendo esto ahora
      </span>
    </p>
  )
}
