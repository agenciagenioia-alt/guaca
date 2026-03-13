'use client'

import { useLoading } from '@/components/providers/LoadingProvider'
import { LoadingScreen } from '@/components/ui/LoadingScreen'

// This component acts as the bridge to conditionally render the LoadingScreen
// based on the global LoadingContext, keeping layout.tsx as a Server Component.
export function GlobalLoader() {
  const { isLoading, setLoadingComplete } = useLoading()

  if (!isLoading) {
    return null
  }

  return <LoadingScreen onComplete={setLoadingComplete} />
}
