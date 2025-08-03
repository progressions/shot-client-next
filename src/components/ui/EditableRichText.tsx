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
  const [isHovered, setIsHovered] = useState(false)
  // const [value, setValue] = useState(html)

  const handleSave = (event: EditorChangeEvent) => {
    console.log("EditorRichText about to handleSave", event)
    if (onChange) {
      console.log("EditorRichText about to submit value", event)
      onChange(event)
    }
  }

  return <Editor name={name} value={html} onChange={handleSave} />

  return (
    <Paper
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <RichTextRenderer html={html || fallback} />
      {editable && isHovered && (
        <MiniButton
          size="mini"
          sx={{
            position: "absolute",
            bottom: 8,
            right: 8,
          }}
          onClick={() => setIsEditing(true)}
        >
          Edit
        </MiniButton>
      )}
    </Paper>
  )
}
