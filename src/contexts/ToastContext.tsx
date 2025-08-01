"use client"

import { createContext, useContext, useState } from "react"

import type { Toast } from "@/types"
import { defaultToast } from "@/types"

interface ToastProviderProps {
  children: React.ReactNode
}

interface ToastContextType {
  toast: Toast
  closeToast: () => void
  toastSuccess: (message: string) => void
  toastError: (message?: string) => void
  toastInfo: (message: string) => void
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

export function useToast(): ToastContextType {
  return useContext(ToastContext)
}
