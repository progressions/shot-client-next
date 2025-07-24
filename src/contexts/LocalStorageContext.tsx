"use client"

import { createContext, useContext } from "react"

export interface LocalStorageContextType {
  saveLocally: (key: string, value: unknown) => void
  getLocally: (key: string) => unknown | null
}

interface LocalStorageProviderProps {
  children: React.ReactNode
}

const LocalStorageContext = createContext<LocalStorageContextType>({
  saveLocally: () => {},
  getLocally: () => null
})

export function LocalStorageProvider({ children }: LocalStorageProviderProps) {
  function saveLocally(key: string, value: unknown) {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(key, JSON.stringify(value))
      } catch (err) {
        console.error("Failed to save to localStorage", err)
      }
    }
  }

  function getLocally(key: string): unknown | null {
    if (typeof window !== "undefined") {
      try {
        const item = localStorage.getItem(key)
        return item ? JSON.parse(item) : null
      } catch (err) {
        console.error("Failed to parse localStorage item", err)
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
