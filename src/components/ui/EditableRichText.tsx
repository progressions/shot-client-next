"use client"

import { Editor } from "@/components/editor"
import type { EditorChangeEvent } from "@/types"

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
  editable: _editable = true,
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
