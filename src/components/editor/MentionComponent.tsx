"use client"

import { NodeViewWrapper, NodeViewProps } from "@tiptap/react"
import { EntityLink } from "@/components/ui"
import {
  CharacterPopup,
  VehiclePopup,
  SitePopup,
  PartyPopup,
  FactionPopup,
  SchtickPopup,
  WeaponPopup,
  JuncturePopup,
} from "@/components/popups"

const popupMap: Record<string, React.ComponentType<unknown>> = {
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

  return (
    <NodeViewWrapper as="span">
      <EntityLink
        entity={{ id, entity_class: className }}
        popupOverride={PopupComponent}
      >
        {label}
      </EntityLink>
    </NodeViewWrapper>
  )
}
