"use client"
<<<<<<< HEAD
import { useEffect, useCallback, useMemo, useRef } from "react"
import dynamic from "next/dynamic"
import CustomMention from "@/components/editor/CustomMention"
import StarterKit from "@tiptap/starter-kit"
import { EditorProvider } from "@tiptap/react"
import { useClient } from "@/contexts"
import { Box, useTheme } from "@mui/material"
import styles from "@/components/editor/Editor.module.scss"
import suggestion from "./suggestion.js"
=======
import { Box } from "@mui/material"
import StarterKit from "@tiptap/starter-kit"
import CustomMention from "@/components/editor/CustomMention"
import styles from "@/components/editor/Editor.module.scss"
import { RichTextEditor } from "mui-tiptap"
import { useCallback, useRef } from "react"
import suggestion from "./suggestion.js"
import type { EditorChangeEvent } from "@/types"
import { useClient } from "@/contexts"
import { useTheme } from "@mui/material/styles"
import { styleOverrides } from "@/components/editor/styleOverrides"
>>>>>>> mui-tiptap

type EditorProps = {
  name: string
  value: string
<<<<<<< HEAD
  onChange: (event: { target: { name: string; value: string } }) => void
}

export function Editor({ name, value, onChange }: EditorProps) {
  const theme = useTheme()
  const { user, client } = useClient()
  const editorReference = useRef(null)
  const contentReference = useRef(value || "")
  const updateReference = useRef(false)

  // Sync editor content with value prop
  useEffect(() => {
    console.log("Editor value prop:", value)
    const editor = editorReference.current?.editor
    if (editor && value !== contentReference.current) {
      console.log("Updating editor content:", value)
      updateReference.current = true
      editor.commands.setContent(value, false, { preserveFocus: true })
      contentReference.current = value
      // Ensure focus is preserved
      if (editor.isFocused) {
        console.log("Preserving editor focus after value update")
        editor.commands.focus()
      }
    }
  }, [value])

  // Custom debounce function
  const debounce = (function_, wait) => {
    let timeout
    return (...arguments_) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        console.log("Debounced onChange firing")
        function_(...arguments_)
      }, wait)
    }
  }

  // Debounced onChange handler
  const debouncedOnChange = useCallback(
    debounce(event => {
      onChange(event)
      const editor = editorReference.current?.editor
      if (editor && editor.isFocused) {
        console.log("Restoring editor focus after debounced onChange")
        editor.commands.focus()
      }
    }, 500),
    [onChange]
  )

  const preprocessContent = html => {
    if (!html) return ""
    let processed = html.replaceAll(/<li><p>(.*?)<\/p><\/li>/g, "<li>$1</li>")
    const regex = new RegExp(
      `<a href="([^"]+)" class="${styles.mention}"[^>]*data-mention-id="([^"]+)"[^>]*data-mention-class-name="([^"]*)"[^>]*>(@[^<]+)</a>`,
      "g"
    )
    processed = processed.replace(
      regex,
      (match, href, id, className, label) => {
        const cleanLabel = label.replace(/^@/, "")
        return `<span data-type="mention" data-id="${id}" data-label="${cleanLabel}" data-href="${href}" data-mention-class-name="${className}">@${cleanLabel}</span>`
      }
    )
    console.log("Editor processedValue:", processed)
    return processed
  }

  const extensions = [
    StarterKit.configure({
      mention: false,
    }),
    CustomMention.configure({
      HTMLAttributes: { class: styles.mention },
      suggestion: suggestion(user, client),
    }),
  ]

  const onChangeContent = useCallback(
    event => {
      const { value } = event.target
      console.log("Editor onChangeContent value:", value)
      contentReference.current = value
      debouncedOnChange(event)
    },
    [debouncedOnChange]
  )

=======
  onChange?: (event: EditorChangeEvent) => void
}

export default function Editor({ name, value, onChange }: EditorProps) {
  const { user, client } = useClient()
  const theme = useTheme()
  const editorReference = useRef(null)
>>>>>>> mui-tiptap
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
<<<<<<< HEAD

  const processedValue = useMemo(() => preprocessContent(value), [value])

  if (!user?.id) return <></>

  return (
    <Box
      sx={{
        width: "100%",
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 1,
        "&:hover": {
          borderColor: theme.palette.primary.main,
        },
        transition: theme.transitions.create("border-color", {
          duration: theme.transitions.duration.short,
          easing: theme.transitions.easing.easeOut,
        }),
      }}
    >
      <EditorProvider
        ref={editorReference}
        name={name}
        sx={{ width: "100%" }}
        immediatelyRender={false}
        extensions={extensions}
        content={processedValue}
        onBlur={saveOnBlur}
        onUpdate={({ editor }) => {
          const html = editor.getHTML()
          if (html !== contentReference.current && !updateReference.current) {
            const syntheticEvent = {
              target: {
                name,
                value: html,
              },
            }
            onChangeContent(syntheticEvent)
          }
          updateReference.current = false
          // Ensure focus is preserved
          if (editor.isFocused) {
            editor.commands.focus()
          }
        }}
=======
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
>>>>>>> mui-tiptap
      />
    </Box>
  )
}
<<<<<<< HEAD

export default dynamic(() => Promise.resolve(Editor), { ssr: false })
=======
>>>>>>> mui-tiptap
