"use client"

import { Link, Avatar } from "@mui/material"
import { RefObject, useRef, useState, useCallback } from "react"
import type { User } from "@/types"
import { SystemStyleObject, Theme } from "@mui/system"
import { ImageViewerModal } from "@/components/ui/ImageViewerModal"

interface UserAvatarProperties {
  user: User
  href?: string
  disablePopup?: boolean
  sx?: SystemStyleObject<Theme>
  disableImageViewer?: boolean
}

const UserAvatar = ({
  user,
  href,
  disablePopup,
  sx = {},
  disableImageViewer = false,
}: UserAvatarProperties) => {
  const avatarReference: RefObject<HTMLDivElement | null> = useRef(null)
  const [imageViewerOpen, setImageViewerOpen] = useState(false)

  const handleAvatarClick = useCallback(
    (event: React.MouseEvent) => {
      if (!disableImageViewer && user?.image_url) {
        event.preventDefault()
        event.stopPropagation()
        setImageViewerOpen(true)
      }
    },
    [user?.image_url, disableImageViewer]
  )

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (
        !disableImageViewer &&
        user.image_url &&
        (event.key === "Enter" || event.key === " ")
      ) {
        event.preventDefault()
        event.stopPropagation()
        setImageViewerOpen(true)
      }
    },
    [user?.image_url, disableImageViewer]
  )

  const handleCloseImageViewer = useCallback(() => {
    setImageViewerOpen(false)
  }, [])

  if (!user?.id) {
    return <></>
  }

  const initials = user.name
    ? user.name
        .split(" ")
        .map(part => part.charAt(0).toUpperCase())
        .join("")
    : ""

  const hasClickableImage = !disableImageViewer && user?.image_url

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
      alt={user.name}
      src={user.image_url || ""}
      ref={avatarReference}
      sx={avatarSx}
      onClick={hasClickableImage ? handleAvatarClick : undefined}
      onKeyDown={hasClickableImage ? handleKeyDown : undefined}
      role={hasClickableImage ? "button" : undefined}
      tabIndex={hasClickableImage ? 0 : undefined}
      aria-label={
        hasClickableImage ? `View full image of ${user.name}` : user.name
      }
    >
      {initials}
    </Avatar>
  )

  const avatarWithViewer = (
    <>
      {avatar}
      {user.image_url && (
        <ImageViewerModal
          open={imageViewerOpen}
          onClose={handleCloseImageViewer}
          imageUrl={user.image_url}
          altText={user.name}
          entity={user}
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
        data-mention-id={user.id}
        data-mention-class-name="User"
        sx={{ padding: 0, ml: -1.5 }}
      >
        {avatar}
      </Link>
    )
  }

  return avatarWithViewer
}

export default UserAvatar
