"use client"

import { Paper } from "@mui/material"
import { Editor, RichTextRenderer } from "@/components/editor"
import { MiniButton } from "@/components/ui"
import { useState } from "react"

type EditableRichTextProps = {
  name: string
  html: string
  editable?: boolean
  onChange?: (event: EditorChangeEvent) => void
  fallback?: string
}

export function EditableRichText({
  name,
  html,
  editable = true,
  onChange,
  fallback,
}: EditableRichTextProps) {
  const handleSave = (event: EditorChangeEvent) => {
    if (onChange) {
      onChange(event)
    }
  }

  return <Editor name={name} value={html} onChange={handleSave} />
}
