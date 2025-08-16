"use client"

import { NodeViewWrapper, NodeViewProps } from "@tiptap/react"
import { Typography, Box } from "@mui/material"
import { useState, useRef } from "react"
import { PopupProps } from "@/types"
import { EntityLink } from "@/components/ui"
import {
  JuncturePopup,
  CharacterPopup,
  VehiclePopup,
  SitePopup,
  PartyPopup,
  FactionPopup,
  SchtickPopup,
  WeaponPopup,
  TypePopup,
  ArchetypePopup,
} from "@/components/popups"

export default function MentionComponent({ node }: NodeViewProps) {
  const { id, label, className, mentionSuggestionChar } = node.attrs
  const displayLabel = label || "unknown"
  const href = getUrl(className, id)

  const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null)
  const timeoutReference = useRef<NodeJS.Timeout | null>(null)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault()
    if (timeoutReference.current) {
      clearTimeout(timeoutReference.current)
    }
    setAnchorElement(event.currentTarget)
  }

  const handlePopoverClick = () => {
    if (timeoutReference.current) {
      clearTimeout(timeoutReference.current)
    }
  }

  const handlePopoverMouseLeave = () => {
    timeoutReference.current = setTimeout(() => {
      setAnchorElement(null)
    }, 200)
  }

  const handleClose = () => {
    setAnchorElement(null)
  }

  const open = Boolean(anchorElement)

  // Mapping object for popup components with TypeScript types
  const popupComponents: { [key: string]: React.ComponentType<PopupProps> } = {
    Juncture: JuncturePopup,
    Character: CharacterPopup,
    Vehicle: VehiclePopup,
    Site: SitePopup,
    Party: PartyPopup,
    Faction: FactionPopup,
    Schtick: SchtickPopup,
    Weapon: WeaponPopup,
    Type: TypePopup,
    Archetype: ArchetypePopup,
  }

  // Get the popup component or fallback to a default
  const PopupComponent =
    popupComponents[className] ||
    (() => (
      <Typography variant="body2">
        No details available for {displayLabel}
      </Typography>
    ))

  const popupContent = (
    <Box sx={{ p: 2, maxWidth: 400 }}>
      <PopupComponent id={id} />
    </Box>
  )

  return (
    <NodeViewWrapper as="span">
      <EntityLink entity={{ id, entity_class: className }}>{label}</EntityLink>
    </NodeViewWrapper>
  )
}

// Restore getUrl to generate the navigation path
function getUrl(className: string, id: string) {
  const urlMap: { [key: string]: string } = {
    Character: `/characters/${id}`,
    Vehicle: `/vehicles/${id}`,
    Site: `/sites/${id}`,
    Party: `/parties/${id}`,
    Faction: `/factions/${id}`,
    Schtick: `/schticks/${id}`,
    Weapon: `/weapons/${id}`,
    Juncture: `/junctures/${id}`,
  }
  return urlMap[className] || "#"
}
