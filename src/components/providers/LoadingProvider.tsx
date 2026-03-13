'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface LoadingContextType {
  isLoading: boolean;
  setLoadingComplete: () => void;
}

const LoadingContext = createContext<LoadingContextType>({
  isLoading: true,
  setLoadingComplete: () => {},
})

export const useLoading = () => useContext(LoadingContext)

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  // We use a simple memory state. Since the root layout is rarely unmounted, 
  // this state will persist for the duration of the browser tab session.
  // We explicitly avoid sessionStorage as requested.
  const [isLoading, setIsLoading] = useState(true)
  
  // Safety fallback: if the loading screen somehow gets stuck, 
  // force un-load after 5 seconds to not completely brick the site.
  useEffect(() => {
    if (!isLoading) return
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 5000)
    return () => clearTimeout(timer)
  }, [isLoading])

  const setLoadingComplete = () => {
    setIsLoading(false)
  }

  return (
    <LoadingContext.Provider value={{ isLoading, setLoadingComplete }}>
      {children}
    </LoadingContext.Provider>
  )
}
