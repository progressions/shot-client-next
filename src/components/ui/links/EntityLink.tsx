"use client"
import { Box, Popover, Link } from "@mui/material"
import { useRef, useState, useEffect } from "react"
import type { Entity } from "@/types"
import pluralize from "pluralize"

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
      target.current = event.currentTarget as HTMLAnchorElement
      openTimeoutId = setTimeout(() => {
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
    if (openTimeoutId) {
      clearTimeout(openTimeoutId)
      openTimeoutId = null
    }
    closeTimeoutId = setTimeout(() => {
      setAnchorEl(null)
      setIsOpen(false)
    }, 200)
  }

  const handleClose = () => {
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
      if (openTimeoutId) clearTimeout(openTimeoutId)
      if (closeTimeoutId) clearTimeout(closeTimeoutId)
      if (scrollTimeoutId) clearTimeout(scrollTimeoutId)
    }
  }, [isOpen, entity?.id, entity?.entity_class])

  if (!entity || !entity.id || !entity.entity_class) return null

  const PopupComponent = popupOverride
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
