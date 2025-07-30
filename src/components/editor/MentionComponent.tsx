"use client"

import { NodeViewWrapper, NodeViewProps } from "@tiptap/react"
import { Chip, Link, Popover, Typography, Box } from "@mui/material"
import { useState, useRef } from "react"
import ClickAwayListener from "@mui/material/ClickAwayListener"
import { PopupProps } from "@/types"
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

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleMouseEnter = (event: React.MouseEvent<HTMLElement>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setAnchorEl(event.currentTarget)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setAnchorEl(null)
    }, 200) // Delay to allow moving to popover
  }

  const handlePopoverMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }

  const handlePopoverMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setAnchorEl(null)
    }, 200)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const open = Boolean(anchorEl)

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
      <ClickAwayListener onClickAway={handleClose}>
        <span>
          <Link
            href={href}
            underline="none"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ display: "inline-flex" }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <Chip
              label={`${mentionSuggestionChar}${displayLabel}`}
              variant="outlined"
              color="primary"
              size="small"
              sx={{ height: "auto", "& .MuiChip-label": { px: 1 } }}
              data-id={id}
              data-label={displayLabel}
              data-mention-class-name={className}
              data-mention-suggestion-char={mentionSuggestionChar}
            />
          </Link>
          <Popover
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
            disableRestoreFocus
            sx={{ pointerEvents: "auto" }}
            onMouseEnter={handlePopoverMouseEnter}
            onMouseLeave={handlePopoverMouseLeave}
          >
            {popupContent}
          </Popover>
        </span>
      </ClickAwayListener>
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
