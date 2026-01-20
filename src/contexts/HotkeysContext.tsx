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
 * - Supports two-key command sequences (g+c, n+v) with visual indicator
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
  useState,
} from "react"

interface HotkeyOptions {
  /** Description shown in help modal */
  description?: string
  /** Allow hotkey even when in input fields (default: false) */
  allowInInput?: boolean
  /** Prevent default browser behavior (default: true) */
  preventDefault?: boolean
  /** Category for grouping in help modal */
  category?: string
}

interface HotkeyRegistration {
  key: string
  handler: () => void
  options: HotkeyOptions
}

/** Command mode state - null means not in command mode */
type CommandMode = "g" | "n" | null

interface HotkeysContextType {
  /** Register a hotkey - returns cleanup function */
  registerHotkey: (
    key: string,
    handler: () => void,
    options?: HotkeyOptions
  ) => () => void
  /** Get all registered hotkeys (for help display) */
  getRegisteredHotkeys: () => Array<{
    key: string
    description: string
    category?: string
  }>
  /** Current command mode (g, n, or null) */
  commandMode: CommandMode
  /** Whether help modal is open */
  helpModalOpen: boolean
  /** Open help modal */
  openHelpModal: () => void
  /** Close help modal */
  closeHelpModal: () => void
}

const defaultContext: HotkeysContextType = {
  registerHotkey: () => () => {},
  getRegisteredHotkeys: () => [],
  commandMode: null,
  helpModalOpen: false,
  openHelpModal: () => {},
  closeHelpModal: () => {},
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

/** Timeout for command mode in milliseconds */
const COMMAND_MODE_TIMEOUT = 1500

export function HotkeysProvider({ children }: HotkeysProviderProps) {
  // Use ref to store hotkeys so we don't need to re-attach event listener
  const hotkeysRef = useRef<Map<string, HotkeyRegistration>>(new Map())

  // Command mode state - use both state (for UI) and ref (for event handler)
  const [commandMode, setCommandMode] = useState<CommandMode>(null)
  const commandModeRef = useRef<CommandMode>(null)
  const commandModeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Help modal state
  const [helpModalOpen, setHelpModalOpen] = useState(false)

  const openHelpModal = useCallback(() => setHelpModalOpen(true), [])
  const closeHelpModal = useCallback(() => setHelpModalOpen(false), [])

  // Clear command mode timeout
  const clearCommandModeTimeout = useCallback(() => {
    if (commandModeTimeoutRef.current) {
      clearTimeout(commandModeTimeoutRef.current)
      commandModeTimeoutRef.current = null
    }
  }, [])

  // Exit command mode
  const exitCommandMode = useCallback(() => {
    clearCommandModeTimeout()
    commandModeRef.current = null
    setCommandMode(null)
  }, [clearCommandModeTimeout])

  // Enter command mode with timeout
  const enterCommandMode = useCallback(
    (mode: "g" | "n") => {
      clearCommandModeTimeout()
      commandModeRef.current = mode
      setCommandMode(mode)
      commandModeTimeoutRef.current = setTimeout(() => {
        commandModeRef.current = null
        setCommandMode(null)
      }, COMMAND_MODE_TIMEOUT)
    },
    [clearCommandModeTimeout]
  )

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
          category: options.category,
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
    const hotkeys: Array<{
      key: string
      description: string
      category?: string
    }> = []
    hotkeysRef.current.forEach(registration => {
      if (registration.options.description) {
        hotkeys.push({
          key: registration.key,
          description: registration.options.description,
          category: registration.options.category,
        })
      }
    })
    return hotkeys.sort((a, b) => a.key.localeCompare(b.key))
  }, [])

  // Global keydown handler
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Read from ref for immediate access (avoids React state closure issues)
      const currentCommandMode = commandModeRef.current
      // Check if we're in a text input
      const inTextInput = isTextInput(document.activeElement)

      // Handle Escape - exit command mode or close help modal
      if (event.key === "Escape") {
        if (currentCommandMode) {
          exitCommandMode()
          event.preventDefault()
          return
        }
        if (helpModalOpen) {
          closeHelpModal()
          event.preventDefault()
          return
        }
      }

      // Don't process hotkeys in text inputs (unless they have allowInInput)
      if (inTextInput) {
        const keyString = getKeyFromEvent(event)
        const registration = hotkeysRef.current.get(keyString)
        if (registration?.options.allowInInput) {
          if (registration.options.preventDefault) {
            event.preventDefault()
          }
          registration.handler()
        }
        return
      }

      const key = event.key.toLowerCase()

      // Handle ? for help modal (shift+/ on most keyboards)
      if (key === "?" || (event.shiftKey && key === "/")) {
        event.preventDefault()
        setHelpModalOpen(prev => !prev)
        return
      }

      // If in command mode, handle the second key
      if (currentCommandMode) {
        const commandKey = `${currentCommandMode}+${key}`
        const registration = hotkeysRef.current.get(commandKey)

        if (registration) {
          event.preventDefault()
          exitCommandMode()
          registration.handler()
          return
        }

        // Invalid second key - exit command mode
        exitCommandMode()
        return
      }

      // Check for command mode entry (g or n)
      if (key === "g" || key === "n") {
        // Check if there are any registered hotkeys for this command mode
        const hasCommandHotkeys = Array.from(hotkeysRef.current.keys()).some(
          k => k.startsWith(`${key}+`)
        )
        if (hasCommandHotkeys) {
          event.preventDefault()
          enterCommandMode(key as "g" | "n")
          return
        }
      }

      // Handle regular single-key hotkeys
      const keyString = getKeyFromEvent(event)
      const registration = hotkeysRef.current.get(keyString)

      if (!registration) return

      if (registration.options.preventDefault) {
        event.preventDefault()
      }

      registration.handler()
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [
    // Note: commandMode removed - we read from commandModeRef to avoid closure issues
    helpModalOpen,
    enterCommandMode,
    exitCommandMode,
    closeHelpModal,
  ])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      clearCommandModeTimeout()
    }
  }, [clearCommandModeTimeout])

  const value = useMemo(
    () => ({
      registerHotkey,
      getRegisteredHotkeys,
      commandMode,
      helpModalOpen,
      openHelpModal,
      closeHelpModal,
    }),
    [
      registerHotkey,
      getRegisteredHotkeys,
      commandMode,
      helpModalOpen,
      openHelpModal,
      closeHelpModal,
    ]
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
