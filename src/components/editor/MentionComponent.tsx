"use client"

import { NodeViewWrapper, NodeViewProps } from "@tiptap/react"
import { EntityLink } from "@/components/ui"

export default function MentionComponent({ node }: NodeViewProps) {
  const { id, label, className } = node.attrs
  const _displayLabel = label || "unknown"

  return (
    <NodeViewWrapper as="span">
      <EntityLink entity={{ id, entity_class: className }}>{label}</EntityLink>
    </NodeViewWrapper>
  )
}
