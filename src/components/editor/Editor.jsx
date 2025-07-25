"use client"

import { useEffect, useCallback, useMemo, useRef } from "react"
import dynamic from "next/dynamic"
import Document from "@tiptap/extension-document"
import CustomMention from "@/components/editor/CustomMention"
import Paragraph from "@tiptap/extension-paragraph"
import Text from "@tiptap/extension-text"
import StarterKit from "@tiptap/starter-kit"
import { EditorProvider } from "@tiptap/react"
import { useClient } from "@/contexts"
import MenuBar from "@/components/editor/MenuBar"
import styles from "@/components/editor/Editor.module.scss"
import suggestion from "./suggestion.js"

function Editor({ name, value, onChange }) {
  const { user, client } = useClient()
  const editorRef = useRef(null)
  const contentRef = useRef(value || "")
  const updateRef = useRef(false)

  // Log re-renders
  useEffect(() => {
    console.log("Editor re-rendered")
  })

  // Sync editor content with value prop
  useEffect(() => {
    console.log("Editor value prop:", value)
    const editor = editorRef.current?.editor
    if (editor && value !== contentRef.current) {
      console.log("Updating editor content:", value)
      updateRef.current = true
      editor.commands.setContent(value, false, { preserveFocus: true })
      contentRef.current = value
      // Ensure focus is preserved
      if (editor.isFocused) {
        console.log("Preserving editor focus after value update")
        editor.commands.focus()
      }
    }
  }, [value])

  // Custom debounce function
  const debounce = (func, wait) => {
    let timeout
    return (...args) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        console.log("Debounced onChange firing")
        func(...args)
      }, wait)
    }
  }

  // Debounced onChange handler
  const debouncedOnChange = useCallback(
    debounce((event) => {
      onChange(event)
      const editor = editorRef.current?.editor
      if (editor && editor.isFocused) {
        console.log("Restoring editor focus after debounced onChange")
        editor.commands.focus()
      }
    }, 500),
    [onChange]
  )

  if (!user?.id) return <></>

  const preprocessContent = (html) => {
    if (!html) return ""
    let processed = html.replace(/<li><p>(.*?)<\/p><\/li>/g, "<li>$1</li>")
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
      Archetype: `/`
    }
    return urlMap[className] || ""
  }

  const extensions = [
    StarterKit.configure({
      mention: false
    }),
    CustomMention.configure({
      HTMLAttributes: { class: styles.mention },
      suggestion: suggestion(user, client),
      renderHTML({ node }) {
        const { id, label, className } = node.attrs
        if (!id || !label) {
          return ["span", { class: styles.mention }, `@${label || "unknown"}`]
        }
        const url = getUrl(className, id)
        return [
          "a",
          {
            href: url,
            class: styles.mention,
            target: "_blank",
            rel: "noopener noreferrer",
            "data-mention-id": id,
            "data-mention-class-name": className || ""
          },
          `@${label}`
        ]
      }
    })
  ]

  const onChangeContent = useCallback(
    (event) => {
      const { value } = event.target
      console.log("onChangeContent value:", value)
      contentRef.current = value
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
          value: html
        }
      }
      console.log("saveOnBlur event:", event)
      onChange(event)
    },
    [name, onChange]
  )

  const processedValue = useMemo(() => preprocessContent(value), [value])

  return (
    <div className={styles.editorContainer}>
      <EditorProvider
        ref={editorRef}
        name={name}
        sx={{ width: "100%" }}
        immediatelyRender={false}
        extensions={extensions}
        slotBefore={<MenuBar />}
        content={processedValue}
        onBlur={saveOnBlur}
        onUpdate={({ editor }) => {
          const html = editor.getHTML()
          if (html !== contentRef.current && !updateRef.current) {
            const syntheticEvent = {
              target: {
                name,
                value: html
              }
            }
            console.log("onUpdate syntheticEvent:", syntheticEvent)
            onChangeContent(syntheticEvent)
          }
          updateRef.current = false
          // Ensure focus is preserved
          if (editor.isFocused) {
            console.log("Preserving editor focus after onUpdate")
            editor.commands.focus()
          }
        }}
      />
    </div>
  )
}

export default dynamic(() => Promise.resolve(Editor), { ssr: false })
