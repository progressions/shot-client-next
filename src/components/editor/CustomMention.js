"use client"

import { Mention } from "@tiptap/extension-mention"
import { ReactNodeViewRenderer } from "@tiptap/react"
import MentionComponent from "./MentionComponent" // Adjust path as needed

const CustomMention = Mention.extend({
  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: element => element.dataset.id,
        renderHTML: attributes => ({
          "data-id": attributes.id || null,
        }),
      },
      label: {
        default: null,
        parseHTML: element => element.dataset.label,
        renderHTML: attributes => ({
          "data-label": attributes.label || null,
        }),
      },
      className: {
        default: null,
        parseHTML: element => element.dataset.mentionClassName,
        renderHTML: attributes => ({
          "data-mention-class-name": attributes.className || null,
        }),
      },
      mentionSuggestionChar: {
        default: "@",
        parseHTML: element =>
          element.dataset.mentionSuggestionChar,
        renderHTML: attributes => ({
          "data-mention-suggestion-char":
            attributes.mentionSuggestionChar || "@",
        }),
      },
    }
  },
  addNodeView() {
    return ReactNodeViewRenderer(MentionComponent)
  },
})

export default CustomMention
