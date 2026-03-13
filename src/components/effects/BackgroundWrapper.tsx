'use client'
import dynamic from 'next/dynamic'

const InteractiveBackground = dynamic(
  () => import('@/components/effects/InteractiveBackground'),
  { ssr: false }
)

export default function BackgroundWrapper() {
  return <InteractiveBackground />
}
