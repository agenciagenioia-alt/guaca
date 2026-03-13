'use client'

import dynamic from 'next/dynamic'

const CustomCursor = dynamic(
  () => import('@/components/effects/CustomCursor'),
  { ssr: false }
)

export default function CursorWrapper() {
  return <CustomCursor />
}
