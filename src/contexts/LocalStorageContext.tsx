"use client"

import { createContext, useContext } from "react"

export interface LocalStorageContextType {
  saveLocally: (key: string, value: unknown) => void
  getLocally: (key: string) => unknown | null
}

interface LocalStorageProviderProperties {
  children: React.ReactNode
}

const LocalStorageContext = createContext<LocalStorageContextType>({
  saveLocally: () => {},
  getLocally: () => null,
})

export function LocalStorageProvider({
  children,
}: LocalStorageProviderProperties) {
  function saveLocally(key: string, value: unknown) {
    if (globalThis.window !== undefined) {
      try {
        localStorage.setItem(key, JSON.stringify(value))
      } catch (error) {
        console.error("Failed to save to localStorage", error)
      }
    }
  }

  function getLocally(key: string): unknown | null {
    if (globalThis.window !== undefined) {
      try {
        const item = localStorage.getItem(key)
        return item ? JSON.parse(item) : null
      } catch (error) {
        console.error("Failed to parse localStorage item", error)
        return null
      }
    }
    return null
  }

  return (
    <LocalStorageContext.Provider value={{ saveLocally, getLocally }}>
      {children}
    </LocalStorageContext.Provider>
  )
}

export function useLocalStorage(): LocalStorageContextType {
  return useContext(LocalStorageContext)
}
