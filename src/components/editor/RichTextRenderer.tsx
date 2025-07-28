"use client"

import { Box } from "@mui/material"
import type { SystemStyleObject, Theme } from "@mui/system"
import DOMPurify from "isomorphic-dompurify"
import styles from "@/components/editor/Editor.module.scss"

interface RichTextRendererProps {
  html: string
  sx?: SystemStyleObject<Theme>
}

export default function RichTextRenderer({ html, sx }: RichTextRendererProps) {
  const sanitizedHTML = DOMPurify.sanitize(html || "", {
    USE_PROFILES: { html: true },
    ADD_ATTR: ["target", "rel", "data-mention-id", "data-mention-class-name", "data-mention-data"],
  })

  return (
    <Box
      className={styles.richText}
      sx={{ color: "#b0bec5", ...sx }}
      dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
    />
  )
}
