"use client"

import { createContext, useContext, useState } from "react"

import type { Toast } from "@/types"
import { defaultToast } from "@/types"

interface ToastProviderProps {
  children: React.ReactNode
}

/**
 * Context type for toast notification functionality.
 * Provides methods to display success, error, info, and warning messages.
 */
interface ToastContextType {
  /** Current toast state including open status, message, and severity */
  toast: Toast
  /** Closes the currently displayed toast */
  closeToast: () => void
  /** Displays a success toast with a green indicator */
  toastSuccess: (message: string) => void
  /** Displays an error toast with a red indicator. Defaults to "There was an error." */
  toastError: (message?: string) => void
  /** Displays an info toast with a blue indicator */
  toastInfo: (message: string) => void
  /** Displays a warning toast with an orange indicator */
  toastWarning: (message: string) => void
}

const defaultContext: ToastContextType = {
  toast: defaultToast,
  closeToast: () => {},
  toastSuccess: (_message: string) => {},
  toastError: (_message?: string) => {},
  toastInfo: (_message: string) => {},
  toastWarning: (_message: string) => {},
}

const ToastContext = createContext<ToastContextType>(defaultContext)

export function ToastProvider({ children }: ToastProviderProps) {
  const [toast, setToast] = useState<Toast>(defaultToast)

  const toastSuccess = (message: string) => {
    setToast({ open: true, message: message, severity: "success" })
  }

  const toastError = (message = "There was an error.") => {
    setToast({ open: true, message: message, severity: "error" })
  }

  const toastInfo = (message: string) => {
    setToast({ open: true, message: message, severity: "info" })
  }

  const toastWarning = (message: string) => {
    setToast({ open: true, message: message, severity: "warning" })
  }

  const closeToast = (): void => {
    setToast((prevToast: Toast) => {
      return { ...prevToast, open: false }
    })
  }

  return (
    <ToastContext.Provider
      value={{
        toast,
        closeToast,
        toastSuccess,
        toastError,
        toastInfo,
        toastWarning,
      }}
    >
      {children}
    </ToastContext.Provider>
  )
}

/**
 * Hook to access toast notification functions.
 * Must be used within a ToastProvider.
 *
 * @returns Toast context with methods: toastSuccess, toastError, toastInfo, toastWarning, closeToast
 *
 * @example
 * ```tsx
 * const { toastSuccess, toastError } = useToast()
 *
 * // After successful API call
 * toastSuccess("Character saved successfully")
 *
 * // After failed API call
 * toastError("Failed to save character")
 * ```
 */
export function useToast(): ToastContextType {
  return useContext(ToastContext)
}
