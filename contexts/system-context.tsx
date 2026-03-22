"use client"

import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Sistema } from '@/lib/api'

interface SystemContextType {
  selectedSystem: Sistema | null
  setSelectedSystem: (system: Sistema | null) => void
}

const SystemContext = createContext<SystemContextType | undefined>(undefined)

export function SystemProvider({ children }: { children: ReactNode }) {
  const [selectedSystem, setSelectedSystem] = useState<Sistema | null>(null)

  return (
    <SystemContext.Provider value={{ selectedSystem, setSelectedSystem }}>
      {children}
    </SystemContext.Provider>
  )
}

export function useSystem() {
  const context = useContext(SystemContext)
  if (context === undefined) {
    throw new Error('useSystem must be used within a SystemProvider')
  }
  return context
}
