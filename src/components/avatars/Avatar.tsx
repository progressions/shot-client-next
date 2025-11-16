"use client"

import { Avatar as MuiAvatar } from "@mui/material"
import { useState, useCallback } from "react"
import type { Entity } from "@/types"
import { SystemStyleObject, Theme } from "@mui/system"
import CharacterLink from "../ui/links/CharacterLink"
import { ImageViewerModal } from "@/components/ui/ImageViewerModal"
import ImpairmentBadge from "@/components/ui/ImpairmentBadge"

interface AvatarProperties {
  entity: Entity
  href?: string
  disablePopup?: boolean
  sx?: SystemStyleObject<Theme>
  disableImageViewer?: boolean
}

const Avatar = ({
  entity,
  href,
  disablePopup,
  sx = {},
  disableImageViewer = false,
}: AvatarProperties) => {
  const [imageViewerOpen, setImageViewerOpen] = useState(false)

  const handleAvatarClick = useCallback(
    (event: React.MouseEvent) => {
      if (!disableImageViewer && entity?.image_url) {
        event.preventDefault()
        event.stopPropagation()
        setImageViewerOpen(true)
      }
    },
    [entity?.image_url, disableImageViewer]
  )

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (
        !disableImageViewer &&
        entity?.image_url &&
        (event.key === "Enter" || event.key === " ")
      ) {
        event.preventDefault()
        event.stopPropagation()
        setImageViewerOpen(true)
      }
    },
    [entity?.image_url, disableImageViewer]
  )

  const handleCloseImageViewer = useCallback(() => {
    setImageViewerOpen(false)
  }, [])

  if (!entity?.id) {
    return <></>
  }

  const initials = entity.name
    ? (() => {
        // Remove parentheses and their contents before splitting
        const cleanedName = entity.name.replace(/\s*\([^)]*\)/g, "").trim()
        const words = cleanedName.split(/\s+/)
        if (words.length === 0) return ""
        if (words.length === 1) return words[0].charAt(0).toUpperCase()

        const firstLetter = words[0].charAt(0).toUpperCase()
        const lastLetter = words[words.length - 1].charAt(0).toUpperCase()
        return firstLetter + lastLetter
      })()
    : ""

  const hasClickableImage = !disableImageViewer && entity?.image_url

  const avatarSx = {
    ...sx,
    ...(hasClickableImage && {
      cursor: "pointer",
      transition: "transform 0.2s ease, opacity 0.2s ease",
      "&:hover": {
        transform: "scale(1.05)",
        opacity: 0.9,
      },
    }),
  }

  // Check if entity has impairments (Character or Vehicle types)
  const impairments =
    "impairments" in entity && typeof entity.impairments === "number"
      ? entity.impairments
      : 0

  const avatarElement = (
    <MuiAvatar
      alt={entity.name}
      src={entity.image_url || ""}
      data-mention-id={entity.id}
      data-mention-class-name={entity.entity_class || "Entity"}
      sx={avatarSx}
      onClick={hasClickableImage ? handleAvatarClick : undefined}
      onKeyDown={hasClickableImage ? handleKeyDown : undefined}
      role={hasClickableImage ? "button" : undefined}
      tabIndex={hasClickableImage ? 0 : undefined}
      aria-label={
        hasClickableImage ? `View full image of ${entity.name}` : entity.name
      }
    >
      {initials}
    </MuiAvatar>
  )

  const baseAvatar = (
    <ImpairmentBadge impairments={impairments}>{avatarElement}</ImpairmentBadge>
  )

  const avatarWithViewer = (
    <>
      {baseAvatar}
      {entity.image_url && (
        <ImageViewerModal
          open={imageViewerOpen}
          onClose={handleCloseImageViewer}
          imageUrl={entity.image_url}
          altText={entity.name}
          entity={entity}
        />
      )}
    </>
  )

  if (disablePopup) {
    return avatarWithViewer
  }

  if (href && !hasClickableImage) {
    return (
      <CharacterLink
        character={entity}
        href={href}
        target="_blank"
        data-mention-id={entity.id}
        data-mention-class-name={entity.entity_class}
        sx={{ padding: 0, ml: -1.5 }}
        noUnderline={true}
      >
        {baseAvatar}
      </CharacterLink>
    )
  }

  return avatarWithViewer
}

export default Avatar
