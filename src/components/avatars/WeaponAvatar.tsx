"use client"

import { Avatar, Link } from "@mui/material"
import { RefObject, useRef, useState, useCallback } from "react"
import type { Weapon } from "@/types"
import { SystemStyleObject, Theme } from "@mui/system"
import { ImageViewerModal } from "@/components/ui/ImageViewerModal"

interface WeaponAvatarProperties {
  weapon: Weapon
  href?: string
  disablePopup?: boolean
  sx?: SystemStyleObject<Theme>
  disableImageViewer?: boolean
}

const WeaponAvatar = ({
  weapon,
  href,
  disablePopup,
  sx = {},
  disableImageViewer = false,
}: WeaponAvatarProperties) => {
  const avatarReference: RefObject<HTMLDivElement | null> = useRef(null)
  const [imageViewerOpen, setImageViewerOpen] = useState(false)

  const handleAvatarClick = useCallback(
    (event: React.MouseEvent) => {
      if (!disableImageViewer && weapon?.image_url) {
        event.preventDefault()
        event.stopPropagation()
        setImageViewerOpen(true)
      }
    },
    [weapon?.image_url, disableImageViewer]
  )

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (
        !disableImageViewer &&
        weapon.image_url &&
        (event.key === "Enter" || event.key === " ")
      ) {
        event.preventDefault()
        event.stopPropagation()
        setImageViewerOpen(true)
      }
    },
    [weapon?.image_url, disableImageViewer]
  )

  const handleCloseImageViewer = useCallback(() => {
    setImageViewerOpen(false)
  }, [])

  if (!weapon?.id) {
    return <></>
  }

  const initials = weapon.name
    ? weapon.name
        .split(" ")
        .map(part => part.charAt(0).toUpperCase())
        .join("")
    : ""

  const hasClickableImage = !disableImageViewer && weapon?.image_url

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

  const baseAvatar = (
    <Avatar
      alt={weapon.name}
      src={weapon.image_url || ""}
      ref={avatarReference}
      sx={avatarSx}
      onClick={hasClickableImage ? handleAvatarClick : undefined}
      onKeyDown={hasClickableImage ? handleKeyDown : undefined}
      role={hasClickableImage ? "button" : undefined}
      tabIndex={hasClickableImage ? 0 : undefined}
      aria-label={
        hasClickableImage ? `View full image of ${weapon.name}` : weapon.name
      }
    >
      {initials}
    </Avatar>
  )

  const avatarWithViewer = (
    <>
      {baseAvatar}
      {weapon.image_url && (
        <ImageViewerModal
          open={imageViewerOpen}
          onClose={handleCloseImageViewer}
          imageUrl={weapon.image_url}
          altText={weapon.name}
          entity={weapon}
        />
      )}
    </>
  )

  if (disablePopup) {
    return avatarWithViewer
  }

  if (href && !hasClickableImage) {
    return (
      <Link
        href={href}
        target="_blank"
        data-mention-id={weapon.id}
        data-mention-class-name="Weapon"
        sx={{ padding: 0, ml: -1.5 }}
      >
        {baseAvatar}
      </Link>
    )
  }

  return avatarWithViewer
}

export default WeaponAvatar
