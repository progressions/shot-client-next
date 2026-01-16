import { ReactRenderer } from "@tiptap/react"
import tippy from "tippy.js"

import MentionList from "./MentionList.jsx"

const suggestion = (user, client) => ({
  items: async ({ query }) => {
    if (user?.id) {
      const response = await client.getSuggestions({ query })
      return response.data
    }
  },
  command: ({ editor, range, props }) => {
    editor
      .chain()
      .focus()
      .insertContentAt(range, {
        type: "mention",
        attrs: {
          id: props.id,
          label: props.label,
          className: props.className,
          mentionSuggestionChar: "@",
        },
      })
      .run()
  },
  render: () => {
    let component
    let popup

    return {
      onStart: properties => {
        component = new ReactRenderer(MentionList, {
          props: properties,
          editor: properties.editor,
        })

        if (!properties.clientRect) {
          return
        }

        popup = tippy("body", {
          getReferenceClientRect: properties.clientRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: "manual",
          placement: "bottom-start",
        })
      },

      onUpdate(properties) {
        if (!component) {
          return
        }

        component.updateProps(properties)

        if (!properties.clientRect) {
          return
        }

        popup?.[0]?.setProps({
          getReferenceClientRect: properties.clientRect,
        })
      },

      onKeyDown(properties) {
        if (!component) {
          return false
        }

        if (properties.event.key === "Escape") {
          popup?.[0]?.hide()
          return true
        }

        return component.ref?.onKeyDown(properties)
      },

      onExit() {
        popup?.[0]?.destroy()
        component?.destroy()
      },
    }
  },
})

export default suggestion
