"use client"

import { useMemo } from "react"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import CustomMention from "@/components/editor/CustomMention" // Adjust path as needed
import styles from "@/components/editor/Editor.module.scss" // Reuse styles if applicable
import type { SystemStyleObject, Theme } from "@mui/system"

interface RichTextRendererProps {
  html: string
  sx?: SystemStyleObject<Theme>
}

export default function RichTextRenderer({ html }: RichTextRendererProps) {
  // Preprocess the HTML just like in the editor (reuse your preprocessContent if it's in a shared util)
  const preprocessContent = (inputHtml: string) => {
    if (!inputHtml) return ""
    let processed = inputHtml.replaceAll(/<li><p>(.*?)<\/p><\/li>/g, "<li>$1</li>")
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
    return processed
  }

  const processedHtml = useMemo(() => preprocessContent(html), [html])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // mention: false
      }),
      CustomMention.configure({
        HTMLAttributes: { class: styles.mention },
        // No suggestion needed for read-only display
        suggestion: {}, // Empty or omit if not required
      }),
    ],
    content: processedHtml,
    editable: false,
    immediatelyRender: false,
  })

  if (!editor) {
    return null
  }

  return (
    <div className={styles.displayContainer}>
      {" "}
      {/* Add a custom class for display styling if needed */}
      <EditorContent editor={editor} />
    </div>
  )
}
