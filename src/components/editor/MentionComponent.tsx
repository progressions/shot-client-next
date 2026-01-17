"use client"

import { NodeViewWrapper, NodeViewProps } from "@tiptap/react"
import { EntityLink } from "@/components/ui"
import {
  AdventurePopup,
  CharacterPopup,
  VehiclePopup,
  SitePopup,
  PartyPopup,
  FactionPopup,
  SchtickPopup,
  WeaponPopup,
  JuncturePopup,
} from "@/components/popups"
import { useEntityName } from "@/hooks"

const popupMap: Record<string, React.ComponentType<unknown>> = {
  Adventure: AdventurePopup,
  Character: CharacterPopup,
  Vehicle: VehiclePopup,
  Site: SitePopup,
  Party: PartyPopup,
  Faction: FactionPopup,
  Schtick: SchtickPopup,
  Weapon: WeaponPopup,
  Juncture: JuncturePopup,
}

export default function MentionComponent({ node }: NodeViewProps) {
  const { id, label, className } = node.attrs
  const PopupComponent = popupMap[className]
  const { name } = useEntityName(id, className)

  // Use fetched name, fall back to static label (shown immediately, no loading state)
  const displayName = name || label

  return (
    <NodeViewWrapper as="span">
      <EntityLink
        entity={{ id, entity_class: className }}
        popupOverride={PopupComponent}
      >
        {displayName}
      </EntityLink>
    </NodeViewWrapper>
  )
}
