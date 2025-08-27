"use client"

import { Link, Avatar } from "@mui/material"
import { RefObject, useRef, useState, useCallback } from "react"
import type { Vehicle } from "@/types"
import { SystemStyleObject, Theme } from "@mui/system"
import { ImageViewerModal } from "@/components/ui/ImageViewerModal"

interface VehicleAvatarProperties {
  vehicle: Vehicle
  href?: string
  disablePopup?: boolean
  sx?: SystemStyleObject<Theme>
  disableImageViewer?: boolean
}

const VehicleAvatar = ({
  vehicle,
  href,
  disablePopup,
  sx = {},
  disableImageViewer = false,
}: VehicleAvatarProperties) => {
  const avatarReference: RefObject<HTMLDivElement | null> = useRef(null)
  const [imageViewerOpen, setImageViewerOpen] = useState(false)

  const handleAvatarClick = useCallback(
    (event: React.MouseEvent) => {
      if (!disableImageViewer && vehicle?.image_url) {
        event.preventDefault()
        event.stopPropagation()
        setImageViewerOpen(true)
      }
    },
    [vehicle?.image_url, disableImageViewer]
  )

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (
        !disableImageViewer &&
        vehicle.image_url &&
        (event.key === "Enter" || event.key === " ")
      ) {
        event.preventDefault()
        event.stopPropagation()
        setImageViewerOpen(true)
      }
    },
    [vehicle?.image_url, disableImageViewer]
  )

  const handleCloseImageViewer = useCallback(() => {
    setImageViewerOpen(false)
  }, [])

  if (!vehicle?.id) {
    return <></>
  }

  const initials = vehicle.name
    ? vehicle.name
        .split(" ")
        .map(part => part.charAt(0).toUpperCase())
        .join("")
    : ""

  const hasClickableImage = !disableImageViewer && vehicle?.image_url

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
      alt={vehicle.name}
      src={vehicle.image_url || ""}
      ref={avatarReference}
      sx={avatarSx}
      onClick={hasClickableImage ? handleAvatarClick : undefined}
      onKeyDown={hasClickableImage ? handleKeyDown : undefined}
      role={hasClickableImage ? "button" : undefined}
      tabIndex={hasClickableImage ? 0 : undefined}
      aria-label={
        hasClickableImage ? `View full image of ${vehicle.name}` : vehicle.name
      }
    >
      {initials}
    </Avatar>
  )

  const avatarWithViewer = (
    <>
      {avatar}
      {vehicle.image_url && (
        <ImageViewerModal
          open={imageViewerOpen}
          onClose={handleCloseImageViewer}
          imageUrl={vehicle.image_url}
          altText={vehicle.name}
          entity={vehicle}
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
        data-mention-id={vehicle.id}
        data-mention-class-name="Vehicle"
        sx={{ padding: 0, ml: -1.5 }}
      >
        {avatar}
      </Link>
    )
  }

  return avatarWithViewer
}

export default VehicleAvatar
