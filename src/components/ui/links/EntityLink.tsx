"use client"
import { Box, Popover, Link } from "@mui/material"
import { useRef, useState, useEffect, useCallback } from "react"
import type { Entity } from "@/types"
import pluralize from "pluralize"
import dynamic from "next/dynamic"

// Dynamically import popup components to avoid loading all upfront
const CharacterPopup = dynamic(
  () => import("@/components/popups/CharacterPopup"),
  { ssr: false }
)
const VehiclePopup = dynamic(() => import("@/components/popups/VehiclePopup"), {
  ssr: false,
})
const SitePopup = dynamic(() => import("@/components/popups/SitePopup"), {
  ssr: false,
})
const PartyPopup = dynamic(() => import("@/components/popups/PartyPopup"), {
  ssr: false,
})
const FactionPopup = dynamic(() => import("@/components/popups/FactionPopup"), {
  ssr: false,
})
const JuncturePopup = dynamic(
  () => import("@/components/popups/JuncturePopup"),
  { ssr: false }
)
const SchtickPopup = dynamic(() => import("@/components/popups/SchtickPopup"), {
  ssr: false,
})
const WeaponPopup = dynamic(() => import("@/components/popups/WeaponPopup"), {
  ssr: false,
})
const FightPopup = dynamic(() => import("@/components/popups/FightPopup"), {
  ssr: false,
})
const UserPopup = dynamic(() => import("@/components/popups/UserPopup"), {
  ssr: false,
})
const CampaignPopup = dynamic(
  () => import("@/components/popups/CampaignPopup"),
  { ssr: false }
)
const TypePopup = dynamic(() => import("@/components/popups/TypePopup"), {
  ssr: false,
})
const ArchetypePopup = dynamic(
  () => import("@/components/popups/ArchetypePopup"),
  { ssr: false }
)

/**
 * Maps entity_class to default popup component.
 * Used when popupOverride is not provided.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const defaultPopupMap: Record<string, React.ComponentType<any>> = {
  Character: CharacterPopup,
  Vehicle: VehiclePopup,
  Site: SitePopup,
  Party: PartyPopup,
  Faction: FactionPopup,
  Juncture: JuncturePopup,
  Schtick: SchtickPopup,
  Weapon: WeaponPopup,
  Fight: FightPopup,
  User: UserPopup,
  Campaign: CampaignPopup,
  Type: TypePopup,
  Archetype: ArchetypePopup,
}

/**
 * Maps entity_class to keyword generation function for popup components.
 * Used to pass context-specific keywords to popup components.
 */
const keywordMap: Record<string, (id: string) => string | undefined> = {
  Archetype: id => `Archetype: ${id}`,
  Type: id => `Type: ${id}`,
  Faction: id => `Faction: ${id}`,
  ActionValue: id => `AV ${id}`,
  Info: id => id,
}

/**
 * Props for the EntityLink component.
 *
 * @property entity - The entity object to link to (must have id and entity_class)
 * @property data - Additional data to store in data-mention-data attribute
 * @property disablePopup - Disable hover popup (defaults to false)
 * @property children - Custom link text (defaults to entity.name)
 * @property sx - Custom styles for the link
 * @property popupOverride - Override the default popup component (auto-detected from entity_class)
 * @property href - Override the auto-generated URL
 * @property noUnderline - Remove underline from link (defaults to false)
 */
type EntityLinkProperties = {
  entity: Entity
  data?: string | object
  disablePopup?: boolean
  children?: React.ReactNode
  sx?: React.CSSProperties
  popupOverride?: React.ComponentType<{
    id: string
    keyword?: string
    handleClose: () => void
    anchorEl: HTMLElement | null
    open: boolean
  }>
  href?: string
  noUnderline?: boolean
}

/**
 * Polymorphic link component for any entity type with automatic hover popup.
 *
 * Automatically generates URLs based on entity_class (e.g., Character → /characters/{id}).
 * Automatically selects the appropriate popup component based on entity_class.
 * Used extensively in rich text content for @mentions.
 *
 * Features:
 * - Auto-generates href from entity_class (pluralized, lowercase)
 * - Auto-selects popup component based on entity_class
 * - Opens in new tab by default
 * - Hover popup with 500ms delay (cancelable)
 * - Popup stays open when hovering over it
 * - Data attributes for mention parsing
 *
 * @example
 * ```tsx
 * // Basic usage - auto-generates URL and popup
 * <EntityLink entity={character} />
 *
 * // With custom popup override
 * <EntityLink entity={character} popupOverride={CustomPopup} />
 *
 * // Custom text and no popup
 * <EntityLink entity={faction} disablePopup>
 *   View {faction.name}'s details
 * </EntityLink>
 * ```
 */
export default function EntityLink({
  entity,
  data,
  disablePopup = false,
  children,
  sx,
  popupOverride,
  href,
  noUnderline = false,
}: EntityLinkProperties) {
  const [anchorEl, setAnchorEl] = useState<HTMLAnchorElement | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const target = useRef<HTMLAnchorElement>(null)
  const openTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleMouseEnterLink = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      if (!disablePopup) {
        target.current = event.currentTarget as HTMLAnchorElement
        openTimeoutRef.current = setTimeout(() => {
          if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current)
            closeTimeoutRef.current = null
          }
          setAnchorEl(target.current)
          setIsOpen(true)
        }, 500)
      }
    },
    [disablePopup]
  )

  const handleMouseEnterPopover = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current)
      openTimeoutRef.current = null
    }
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current)
      openTimeoutRef.current = null
    }
    closeTimeoutRef.current = setTimeout(() => {
      setAnchorEl(null)
      setIsOpen(false)
    }, 200)
  }, [])

  const handleClose = useCallback(() => {
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current)
      openTimeoutRef.current = null
    }
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
    setAnchorEl(null)
    setIsOpen(false)
  }, [])

  // Update anchorEl on scroll with debouncing to prevent excessive updates
  useEffect(() => {
    if (!entity?.id) return
    let scrollTimeoutId: NodeJS.Timeout | null = null
    const handleScroll = () => {
      if (isOpen && target.current) {
        if (scrollTimeoutId) clearTimeout(scrollTimeoutId)
        scrollTimeoutId = setTimeout(() => {
          setAnchorEl(target.current)
        }, 50)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current)
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)
      if (scrollTimeoutId) clearTimeout(scrollTimeoutId)
    }
  }, [isOpen, entity?.id, entity?.entity_class])

  if (!entity || !entity.id || !entity.entity_class) return null

  // Use popupOverride if provided, otherwise look up default popup for entity_class
  const PopupComponent =
    popupOverride || defaultPopupMap[entity.entity_class] || null
  const keyword = keywordMap[entity.entity_class]?.(entity.id)

  return (
    <>
      <Link
        component="a"
        href={
          href ||
          `/${pluralize(entity.entity_class?.toLowerCase() || "")}/${entity.id}`
        }
        target="_blank"
        data-mention-id={entity.id}
        data-mention-class-name={entity.entity_class}
        data-mention-data={data ? JSON.stringify(data) : undefined}
        sx={{
          fontWeight: "bold",
          textDecoration: noUnderline
            ? "none !important"
            : "underline !important",
          color: "#fff !important",
          ...sx,
        }}
        onMouseEnter={handleMouseEnterLink}
        onMouseLeave={handleMouseLeave}
      >
        {children || entity.name}
      </Link>
      {PopupComponent && (
        <Popover
          open={isOpen}
          anchorEl={anchorEl}
          onClose={handleMouseLeave}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
          disableRestoreFocus
          disableScrollLock
          sx={{ pointerEvents: "none" }}
          PaperProps={{
            sx: { maxWidth: "90vw", maxHeight: "50vh", overflow: "auto" },
          }}
        >
          <Box
            sx={{ px: 2, maxWidth: 400, pointerEvents: "auto" }}
            onMouseEnter={handleMouseEnterPopover}
            onMouseLeave={handleMouseLeave}
          >
            <PopupComponent
              id={entity.id}
              keyword={keyword}
              handleClose={handleClose}
              anchorEl={anchorEl}
              open={isOpen}
            />
          </Box>
        </Popover>
      )}
    </>
  )
}
