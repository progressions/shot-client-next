"use client"

import { useState, useEffect } from "react"
import DOMPurify from "dompurify"

interface RichTextRendererProps {
  html: string
}

export default function RichTextRenderer({ html }: RichTextRendererProps) {
  const [sanitizedHTML, setSanitizedHTML] = useState("")

  useEffect(() => {
    const clean = DOMPurify.sanitize(html || '', {
      USE_PROFILES: { html: true },
      ADD_ATTR: ['target', 'rel', 'data-mention-id', 'data-mention-class-name'],
    })

    setSanitizedHTML(clean)
  }, [html])

  return (
    <div
      style={{ color: "#b0bec5" }}
      dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
    />
  )
}
