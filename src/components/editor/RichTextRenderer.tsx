"use client"

import { Box } from "@mui/material"
import type { SystemStyleObject, Theme } from "@mui/system"
import { useState, useEffect } from "react"
import DOMPurify from "dompurify"

interface RichTextRendererProps {
  html: string
  sx?: SystemStyleObject<Theme>
}

export default function RichTextRenderer({ html, sx }: RichTextRendererProps) {
  const [sanitizedHTML, setSanitizedHTML] = useState("")

  useEffect(() => {
    const clean = DOMPurify.sanitize(html || '', {
      USE_PROFILES: { html: true },
      ADD_ATTR: ['target', 'rel', 'data-mention-id', 'data-mention-class-name'],
    })

    setSanitizedHTML(clean)
  }, [html])

  return (
    <Box
      style={{ color: "#b0bec5" }}
      sx={{ color: "#b0bec5", ...sx }}
      dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
    />
  )
}
