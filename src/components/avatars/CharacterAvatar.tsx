"use client"

import { Link, Avatar } from "@mui/material"
import { RefObject, useRef, useState, useCallback } from "react"
import type { Character } from "@/types"
import { SystemStyleObject, Theme } from "@mui/system"
import { ImageViewerModal } from "@/components/ui/ImageViewerModal"

interface CharacterAvatarProperties {
  character: Character
  href?: string
  disablePopup?: boolean
  sx?: SystemStyleObject<Theme>
  disableImageViewer?: boolean
}

const CharacterAvatar = ({
  character,
  href,
  disablePopup,
  sx = {},
  disableImageViewer = false,
}: CharacterAvatarProperties) => {
  const avatarReference: RefObject<HTMLDivElement | null> = useRef(null)
  const [imageViewerOpen, setImageViewerOpen] = useState(false)

  const handleAvatarClick = useCallback(
    (event: React.MouseEvent) => {
      if (!disableImageViewer && character?.image_url) {
        event.preventDefault()
        event.stopPropagation()
        setImageViewerOpen(true)
      }
    },
    [character?.image_url, disableImageViewer]
  )

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (
        !disableImageViewer &&
        character?.image_url &&
        (event.key === "Enter" || event.key === " ")
      ) {
        event.preventDefault()
        event.stopPropagation()
        setImageViewerOpen(true)
      }
    },
    [character?.image_url, disableImageViewer]
  )

  const handleCloseImageViewer = useCallback(() => {
    setImageViewerOpen(false)
  }, [])

  if (!character?.id) {
    return <></>
  }

  const initials = character.name
    ? character.name
        .split(" ")
        .map((part: string) => part.charAt(0).toUpperCase())
        .join("")
    : ""

  const hasClickableImage = !disableImageViewer && character.image_url

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

  const avatar = (
    <Avatar
      alt={character.name}
      src={character.image_url || ""}
      ref={avatarReference}
      sx={avatarSx}
      onClick={hasClickableImage ? handleAvatarClick : undefined}
      onKeyDown={hasClickableImage ? handleKeyDown : undefined}
      role={hasClickableImage ? "button" : undefined}
      tabIndex={hasClickableImage ? 0 : undefined}
      aria-label={
        hasClickableImage
          ? `View full image of ${character.name}`
          : character.name
      }
    >
      {initials}
    </Avatar>
  )

  const avatarWithViewer = (
    <>
      {avatar}
      {character.image_url && (
        <ImageViewerModal
          open={imageViewerOpen}
          onClose={handleCloseImageViewer}
          imageUrl={character.image_url}
          altText={character.name}
          entity={character}
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
        data-mention-id={character.id}
        data-mention-class-name="Character"
        sx={{ padding: 0, ml: -1.5 }}
      >
        {avatar}
      </Link>
    )
  }

  return avatarWithViewer
}

export default CharacterAvatar
