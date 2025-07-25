import Mention from "@tiptap/extension-mention"

const CustomMention = Mention.extend({
  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-id"),
        renderHTML: (attributes) => ({
          "data-id": attributes.id || null
        })
      },
      label: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-label"),
        renderHTML: (attributes) => ({
          "data-label": attributes.label || null
        })
      },
      className: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-mention-class-name"),
        renderHTML: (attributes) => ({
          "data-mention-class-name": attributes.className || null
        })
      },
      mentionSuggestionChar: {
        default: "@",
        parseHTML: (element) => element.getAttribute("data-mention-suggestion-char"),
        renderHTML: (attributes) => ({
          "data-mention-suggestion-char": attributes.mentionSuggestionChar || "@"
        })
      }
    }
  }
})

export default CustomMention
