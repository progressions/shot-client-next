"use client"

import { useState, useRef, useEffect, useCallback } from "react"

interface UsePopOutWindowReturn {
  popOut: () => Window | null
  popIn: () => void
  isPoppedOut: boolean
  containerEl: HTMLElement | null
}

export function usePopOutWindow(title: string): UsePopOutWindowReturn {
  const [isPoppedOut, setIsPoppedOut] = useState(false)
  const [containerEl, setContainerEl] = useState<HTMLElement | null>(null)
  const windowRef = useRef<Window | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const cleanup = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
    if (windowRef.current && !windowRef.current.closed) {
      windowRef.current.close()
    }
    windowRef.current = null
    setContainerEl(null)
    setIsPoppedOut(false)
  }, [])

  const popOut = useCallback(() => {
    // If already open, just focus and return the existing window
    if (windowRef.current && !windowRef.current.closed) {
      windowRef.current.focus()
      return windowRef.current
    }

    const newWindow = window.open(
      "",
      title,
      "width=900,height=700,toolbar=no,menubar=no,resizable=yes,scrollbars=yes"
    )

    if (!newWindow) {
      return null
    }

    newWindow.document.title = title

    // Set up basic styling on the new window body
    const body = newWindow.document.body
    body.style.margin = "0"
    body.style.padding = "0"
    body.style.backgroundColor = "#0a0a0a"
    body.style.color = "#fafafa"
    body.style.fontFamily = "Arial, Helvetica, sans-serif"

    // Create container div for the portal
    const container = newWindow.document.createElement("div")
    container.id = "pop-out-root"
    body.appendChild(container)

    windowRef.current = newWindow
    setContainerEl(container)
    setIsPoppedOut(true)

    // Detect window close via lifecycle events
    const handleUnload = () => {
      cleanup()
    }
    newWindow.addEventListener("beforeunload", handleUnload)
    newWindow.addEventListener("unload", handleUnload)

    // Fallback poll in case events are missed
    pollRef.current = setInterval(() => {
      if (newWindow.closed) {
        cleanup()
      }
    }, 2000)

    return newWindow
  }, [title, cleanup])

  const popIn = useCallback(() => {
    cleanup()
  }, [cleanup])

  // Close child window on parent beforeunload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (windowRef.current && !windowRef.current.closed) {
        windowRef.current.close()
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      cleanup()
    }
  }, [cleanup])

  return { popOut, popIn, isPoppedOut, containerEl }
}
