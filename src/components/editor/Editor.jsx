"use client"

import { useEffect, useCallback, useMemo, useRef } from "react"
import dynamic from "next/dynamic"
import CustomMention from "@/components/editor/CustomMention"
import StarterKit from "@tiptap/starter-kit"
import { EditorProvider } from "@tiptap/react"
import { useClient } from "@/contexts"
import styles from "@/components/editor/Editor.module.scss"
import suggestion from "./suggestion.js"

function Editor({ name, value, onChange }) {
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

  if (!user?.id) return <></>

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

  const getUrl = (className, id) => {
    const urlMap = {
      Character: `/characters/${id}`,
      Vehicle: `/vehicles/${id}`,
      Site: `/sites/${id}`,
      Party: `/parties/${id}`,
      Faction: `/factions/${id}`,
      Schtick: `/schticks/${id}`,
      Weapon: `/weapons/${id}`,
      Juncture: `/junctures/${id}`,
      Type: `/`,
      Archetype: `/`,
    }
    return urlMap[className] || ""
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

  const processedValue = useMemo(() => preprocessContent(value), [value])

  return (
    <div className={styles.editorContainer}>
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
      />
    </div>
  )
}

export default dynamic(() => Promise.resolve(Editor), { ssr: false })
