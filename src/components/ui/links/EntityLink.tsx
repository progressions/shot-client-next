"use client"
import { Box, Popover, Link } from "@mui/material"
import { useRef, useState, useEffect } from "react"
import type { Entity } from "@/types"
import { CharacterPopup } from "@/components/popups"
import { CharacterName } from "@/components/names"
import pluralize from "pluralize"
import { namePropNames, nameComponents, popupComponents } from "@/lib/maps"

// Map entity_class to keyword generation function
const keywordMap: Record<string, (id: string) => string | undefined> = {
  Archetype: id => `Archetype: ${id}`,
  Type: id => `Type: ${id}`,
  Faction: id => `Faction: ${id}`,
  ActionValue: id => `AV ${id}`,
  Info: id => id,
}

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
}

export default function EntityLink({
  entity,
  data,
  disablePopup = false,
  children,
  sx,
  popupOverride,
  href,
}: EntityLinkProperties) {
  const [anchorEl, setAnchorEl] = useState<HTMLAnchorElement | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const target = useRef<HTMLAnchorElement>(null)
  let openTimeoutId: NodeJS.Timeout | null = null
  let closeTimeoutId: NodeJS.Timeout | null = null

  const handleMouseEnterLink = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!disablePopup) {
      console.log("Mouse enter link: Setting timeout for popover", {
        linkPosition: event.currentTarget.getBoundingClientRect(),
        entityId: entity.id,
        entityClass: entity.entity_class,
      })
      target.current = event.currentTarget as HTMLAnchorElement
      openTimeoutId = setTimeout(() => {
        console.log("Timeout complete: Setting anchorEl", {
          anchorEl: target.current,
          position: target.current?.getBoundingClientRect(),
          entityId: entity.id,
          entityClass: entity.entity_class,
        })
        if (closeTimeoutId) {
          clearTimeout(closeTimeoutId)
          closeTimeoutId = null
        }
        setAnchorEl(target.current)
        setIsOpen(true)
      }, 500)
    }
  }

  const handleMouseEnterPopover = () => {
    console.log("Mouse enter popover: Keeping open", {
      entityId: entity.id,
      entityClass: entity.entity_class,
    })
    if (closeTimeoutId) {
      clearTimeout(closeTimeoutId)
      closeTimeoutId = null
    }
    if (openTimeoutId) {
      clearTimeout(openTimeoutId)
      openTimeoutId = null
    }
  }

  const handleMouseLeave = () => {
    console.log("Mouse leave: Scheduling popover close", {
      entityId: entity.id,
      entityClass: entity.entity_class,
    })
    if (openTimeoutId) {
      clearTimeout(openTimeoutId)
      openTimeoutId = null
    }
    closeTimeoutId = setTimeout(() => {
      console.log("Closing popover after delay", {
        entityId: entity.id,
        entityClass: entity.entity_class,
      })
      setAnchorEl(null)
      setIsOpen(false)
    }, 200)
  }

  const handleClose = () => {
    console.log("Handle close called", {
      entityId: entity.id,
      entityClass: entity.entity_class,
    })
    if (openTimeoutId) {
      clearTimeout(openTimeoutId)
      openTimeoutId = null
    }
    if (closeTimeoutId) {
      clearTimeout(closeTimeoutId)
      closeTimeoutId = null
    }
    setAnchorEl(null)
    setIsOpen(false)
  }

  // Update anchorEl on scroll with debouncing to prevent excessive updates
  useEffect(() => {
    let scrollTimeoutId: NodeJS.Timeout | null = null
    const handleScroll = () => {
      if (isOpen && target.current) {
        if (scrollTimeoutId) clearTimeout(scrollTimeoutId)
        scrollTimeoutId = setTimeout(() => {
          console.log("Scroll detected: Updating anchorEl", {
            position: target.current.getBoundingClientRect(),
            entityId: entity.id,
            entityClass: entity.entity_class,
          })
          setAnchorEl(target.current)
        }, 50)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (openTimeoutId) clearTimeout(openTimeoutId)
      if (closeTimeoutId) clearTimeout(closeTimeoutId)
      if (scrollTimeoutId) clearTimeout(scrollTimeoutId)
    }
  }, [isOpen, entity.id, entity.entity_class])

  // Get the appropriate Popup and Name components and prop name
  const PopupComponent =
    popupOverride || popupComponents[entity.entity_class] || CharacterPopup
  const NameComponent = nameComponents[entity.entity_class] || CharacterName
  const namePropName = namePropNames[entity.entity_class] || "character"

  // Set keyword using hash map
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
          textDecoration: "underline !important",
          color: "#fff !important",
          ...sx,
        }}
        onMouseEnter={handleMouseEnterLink}
        onMouseLeave={handleMouseLeave}
      >
        {children || <NameComponent {...{ [namePropName]: entity }} />}
      </Link>
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
    </>
  )
}
