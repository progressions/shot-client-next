"use client"

/**
 * ConfirmContext - Global Confirmation Dialog System
 *
 * Provides a centralized confirmation dialog that can be triggered from
 * anywhere in the application using an async/await pattern.
 *
 * Features:
 * - Promise-based API - returns true/false based on user action
 * - Customizable title, message, and button text
 * - Destructive action styling option
 * - Single dialog at a time
 *
 * @module contexts/ConfirmContext
 */

import { createContext, useContext, useState, useCallback } from "react"

import type { ConfirmOptions, ConfirmState } from "@/types"
import { defaultConfirmState, defaultConfirmOptions } from "@/types"

interface ConfirmContextType {
  /** Current confirm dialog state */
  confirmState: ConfirmState
  /** Opens confirm dialog and returns Promise<boolean> */
  confirm: (options: ConfirmOptions | string) => Promise<boolean>
  /** Handles user confirmation */
  handleConfirm: () => void
  /** Handles user cancellation */
  handleCancel: () => void
}

const defaultContext: ConfirmContextType = {
  confirmState: defaultConfirmState,
  confirm: async () => false,
  handleConfirm: () => {},
  handleCancel: () => {},
}

const ConfirmContext = createContext<ConfirmContextType>(defaultContext)

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [confirmState, setConfirmState] =
    useState<ConfirmState>(defaultConfirmState)

  const confirm = useCallback(
    (options: ConfirmOptions | string): Promise<boolean> => {
      return new Promise(resolve => {
        const normalizedOptions: ConfirmOptions =
          typeof options === "string"
            ? { ...defaultConfirmOptions, message: options }
            : { ...defaultConfirmOptions, ...options }

        setConfirmState({
          open: true,
          options: normalizedOptions,
          resolve,
        })
      })
    },
    []
  )

  const handleConfirm = useCallback(() => {
    if (confirmState.resolve) {
      confirmState.resolve(true)
    }
    setConfirmState(defaultConfirmState)
  }, [confirmState.resolve])

  const handleCancel = useCallback(() => {
    if (confirmState.resolve) {
      confirmState.resolve(false)
    }
    setConfirmState(defaultConfirmState)
  }, [confirmState.resolve])

  return (
    <ConfirmContext.Provider
      value={{
        confirmState,
        confirm,
        handleConfirm,
        handleCancel,
      }}
    >
      {children}
    </ConfirmContext.Provider>
  )
}

/**
 * Hook to access confirmation dialog functionality.
 * Must be used within a ConfirmProvider.
 *
 * @returns ConfirmContext with confirm() function
 *
 * @example
 * ```tsx
 * const { confirm } = useConfirm()
 *
 * const handleDelete = async () => {
 *   const confirmed = await confirm({
 *     title: "Delete Character",
 *     message: `Are you sure you want to delete ${character.name}?`,
 *     confirmText: "Delete",
 *     confirmColor: "error",
 *     destructive: true,
 *   })
 *
 *   if (confirmed) {
 *     await client.deleteCharacter(character.id)
 *   }
 * }
 *
 * // Or simple string usage:
 * const confirmed = await confirm("Are you sure?")
 * ```
 */
export function useConfirm(): ConfirmContextType {
  return useContext(ConfirmContext)
}
