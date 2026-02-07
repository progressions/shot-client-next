"use client"

import { useMemo } from "react"
import { createPortal } from "react-dom"
import createCache from "@emotion/cache"
import { CacheProvider } from "@emotion/react"
import { ThemeProvider } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import theme from "@/theme"

interface PopOutWindowProps {
  isPoppedOut: boolean
  containerEl: HTMLElement | null
  children: React.ReactNode
}

export default function PopOutWindow({
  isPoppedOut,
  containerEl,
  children,
}: PopOutWindowProps) {
  const emotionCache = useMemo(() => {
    if (!containerEl) return null
    return createCache({
      key: "popout",
      container: containerEl.ownerDocument.head,
    })
  }, [containerEl])

  if (!isPoppedOut || !containerEl || !emotionCache) return null

  return createPortal(
    <CacheProvider value={emotionCache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>,
    containerEl
  )
}
