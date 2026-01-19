"use client"

/**
 * HotkeysContext - Global Keyboard Shortcut System
 *
 * Provides a centralized hotkey system for registering and handling
 * keyboard shortcuts throughout the application.
 *
 * Features:
 * - Register hotkeys with descriptions for help display
 * - Automatically ignores keypresses in text inputs
 * - Supports single keys (k) and modifier combos (ctrl+k, cmd+shift+p)
 * - Clean registration/unregistration on component mount/unmount
 *
 * @module contexts/HotkeysContext
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react"

interface HotkeyOptions {
  /** Description shown in help modal */
  description?: string
  /** Allow hotkey even when in input fields (default: false) */
  allowInInput?: boolean
  /** Prevent default browser behavior (default: true) */
  preventDefault?: boolean
}

interface HotkeyRegistration {
  key: string
  handler: () => void
  options: HotkeyOptions
}

interface HotkeysContextType {
  /** Register a hotkey - returns cleanup function */
  registerHotkey: (
    key: string,
    handler: () => void,
    options?: HotkeyOptions
  ) => () => void
  /** Get all registered hotkeys (for help display) */
  getRegisteredHotkeys: () => Array<{ key: string; description: string }>
}

const defaultContext: HotkeysContextType = {
  registerHotkey: () => () => {},
  getRegisteredHotkeys: () => [],
}

const HotkeysContext = createContext<HotkeysContextType>(defaultContext)

interface HotkeysProviderProps {
  children: React.ReactNode
}

/**
 * Check if the currently focused element is a text input
 */
function isTextInput(element: Element | null): boolean {
  if (!element) return false

  const tagName = element.tagName.toLowerCase()
  if (tagName === "input") {
    const inputType = (element as HTMLInputElement).type.toLowerCase()
    // Allow hotkeys for non-text inputs like checkboxes, radios, buttons
    const textInputTypes = [
      "text",
      "password",
      "email",
      "number",
      "search",
      "tel",
      "url",
      "textarea",
    ]
    return textInputTypes.includes(inputType)
  }

  if (tagName === "textarea") return true
  if (element.getAttribute("contenteditable") === "true") return true

  return false
}

/**
 * Normalize a key string for comparison
 * Handles modifiers: ctrl, cmd/meta, alt, shift
 * Examples: "k", "ctrl+k", "cmd+shift+p"
 */
function normalizeKey(key: string): string {
  return key.toLowerCase().trim()
}

/**
 * Build a key string from a keyboard event
 */
function getKeyFromEvent(event: KeyboardEvent): string {
  const parts: string[] = []

  if (event.ctrlKey) parts.push("ctrl")
  if (event.metaKey) parts.push("cmd")
  if (event.altKey) parts.push("alt")
  if (event.shiftKey) parts.push("shift")

  // Normalize the key
  const key = event.key.toLowerCase()

  // Don't add modifier keys as the main key
  if (!["control", "meta", "alt", "shift"].includes(key)) {
    parts.push(key)
  }

  return parts.join("+")
}

export function HotkeysProvider({ children }: HotkeysProviderProps) {
  // Use ref to store hotkeys so we don't need to re-attach event listener
  const hotkeysRef = useRef<Map<string, HotkeyRegistration>>(new Map())

  const registerHotkey = useCallback(
    (key: string, handler: () => void, options: HotkeyOptions = {}) => {
      const normalizedKey = normalizeKey(key)
      const registration: HotkeyRegistration = {
        key: normalizedKey,
        handler,
        options: {
          description: options.description ?? "",
          allowInInput: options.allowInInput ?? false,
          preventDefault: options.preventDefault ?? true,
        },
      }

      hotkeysRef.current.set(normalizedKey, registration)

      // Return cleanup function
      return () => {
        hotkeysRef.current.delete(normalizedKey)
      }
    },
    []
  )

  const getRegisteredHotkeys = useCallback(() => {
    const hotkeys: Array<{ key: string; description: string }> = []
    hotkeysRef.current.forEach(registration => {
      if (registration.options.description) {
        hotkeys.push({
          key: registration.key,
          description: registration.options.description,
        })
      }
    })
    return hotkeys.sort((a, b) => a.key.localeCompare(b.key))
  }, [])

  // Global keydown handler
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const keyString = getKeyFromEvent(event)
      const registration = hotkeysRef.current.get(keyString)

      if (!registration) return

      // Check if we're in a text input and hotkey doesn't allow it
      if (
        !registration.options.allowInInput &&
        isTextInput(document.activeElement)
      ) {
        return
      }

      // Prevent default if configured
      if (registration.options.preventDefault) {
        event.preventDefault()
      }

      registration.handler()
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  const value = useMemo(
    () => ({
      registerHotkey,
      getRegisteredHotkeys,
    }),
    [registerHotkey, getRegisteredHotkeys]
  )

  return (
    <HotkeysContext.Provider value={value}>{children}</HotkeysContext.Provider>
  )
}

/**
 * Hook to access the hotkey registration system.
 * Must be used within a HotkeysProvider.
 *
 * @returns Hotkey context with registerHotkey and getRegisteredHotkeys methods
 *
 * @example
 * ```tsx
 * const { registerHotkey } = useHotkeys()
 *
 * useEffect(() => {
 *   return registerHotkey("k", () => setSearchOpen(true), {
 *     description: "Open search"
 *   })
 * }, [registerHotkey])
 * ```
 */
export function useHotkeys(): HotkeysContextType {
  return useContext(HotkeysContext)
}

/**
 * Convenience hook to register a single hotkey.
 * Automatically handles cleanup on unmount.
 *
 * @param key - The key or key combination (e.g., "k", "ctrl+k", "cmd+shift+p")
 * @param handler - Function to call when hotkey is pressed
 * @param options - Optional configuration (description, allowInInput, preventDefault)
 *
 * @example
 * ```tsx
 * // Open search with K key
 * useHotkey("k", () => setOpen(true), { description: "Open search" })
 *
 * // Close modal with Escape
 * useHotkey("escape", onClose, { description: "Close" })
 *
 * // Ctrl+S to save (works in inputs too)
 * useHotkey("ctrl+s", handleSave, { allowInInput: true, description: "Save" })
 * ```
 */
export function useHotkey(
  key: string,
  handler: () => void,
  options: HotkeyOptions = {}
) {
  const { registerHotkey } = useHotkeys()

  useEffect(() => {
    return registerHotkey(key, handler, options)
  }, [key, handler, options, registerHotkey])
}
