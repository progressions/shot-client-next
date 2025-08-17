"use client"
import { Box } from "@mui/material"
import StarterKit from "@tiptap/starter-kit"
import CustomMention from "@/components/editor/CustomMention"
import styles from "@/components/editor/Editor.module.scss"
import { RichTextEditor } from "mui-tiptap"
import { useCallback, useRef, useEffect } from "react"
import suggestion from "./suggestion.js"
import type { EditorChangeEvent } from "@/types"
import { useClient } from "@/contexts"
import { useTheme } from "@mui/material/styles"
import { styleOverrides } from "@/components/editor/styleOverrides"

type EditorProps = {
  name: string
  value: string
  onChange?: (event: EditorChangeEvent) => void
}

export default function Editor({ name, value, onChange }: EditorProps) {
  const { user, client } = useClient()
  const theme = useTheme()
  const editorReference = useRef(null)
  const saveOnBlur = useCallback(
    ({ editor }) => {
      const html = editor.getHTML()
      const event = {
        target: {
          name,
          value: html,
        },
      }
      console.log("Editor saveOnBlur event:", event)
      onChange(event)
    },
    [name, onChange]
  )
  // Sync editor content when value prop changes
  useEffect(() => {
    if (editorReference.current) {
      const editorComponent = editorReference.current
      // Access the actual TipTap editor instance
      const editor = editorComponent.editor
      if (editor) {
        const currentContent = editor.getHTML()
        if (currentContent !== value && value !== undefined) {
          console.log("Editor syncing content from prop change:", { currentContent, newValue: value })
          editor.commands.setContent(value || "")
        }
      }
    }
  }, [value])

  const extensions = [
    StarterKit.configure({
      mention: false,
    }),
    CustomMention.configure({
      HTMLAttributes: { class: styles.mention },
      suggestion: suggestion(user, client),
    }),
  ]
  return (
    <Box
      sx={{
        border: `1px solid ${theme.palette.divider} !important`,
        borderRadius: `${theme.shape.borderRadius}px`,
        "&:hover": {
          border: `1px solid ${theme.palette.primary.main} !important`,
        },
      }}
    >
      <RichTextEditor
        ref={editorReference}
        extensions={extensions}
        content={value || ""}
        name={name}
        immediatelyRender={false}
        onBlur={saveOnBlur}
        sx={styleOverrides}
      />
    </Box>
  )
}
