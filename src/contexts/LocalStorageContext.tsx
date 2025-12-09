"use client"

import { createContext, useContext } from "react"

/**
 * Context type for localStorage operations.
 *
 * @property saveLocally - Save a value to localStorage (JSON serialized)
 * @property getLocally - Retrieve a value from localStorage (JSON parsed)
 */
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

/**
 * Provider component for localStorage access throughout the app.
 *
 * Wraps localStorage operations with:
 * - SSR safety (checks for window availability)
 * - Automatic JSON serialization/parsing
 * - Error handling with console logging
 *
 * @example
 * ```tsx
 * // In app layout
 * <LocalStorageProvider>
 *   <App />
 * </LocalStorageProvider>
 * ```
 */
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

/**
 * Hook for accessing localStorage with SSR-safe operations.
 *
 * Provides saveLocally and getLocally functions that handle:
 * - JSON serialization/parsing automatically
 * - SSR safety (no-ops when window is undefined)
 * - Error handling for storage quota and parse errors
 *
 * @returns Object with saveLocally and getLocally functions
 *
 * @example
 * ```tsx
 * const { saveLocally, getLocally } = useLocalStorage()
 *
 * // Save user preferences
 * saveLocally('userPrefs', { theme: 'dark', fontSize: 14 })
 *
 * // Retrieve with type assertion
 * const prefs = getLocally('userPrefs') as UserPrefs | null
 * ```
 */
export function useLocalStorage(): LocalStorageContextType {
  return useContext(LocalStorageContext)
}
