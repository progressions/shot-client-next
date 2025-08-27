"use client"

import { Avatar, Link } from "@mui/material"
import { RefObject, useRef, useState, useCallback } from "react"
import type { Campaign } from "@/types"
import { SystemStyleObject, Theme } from "@mui/system"
import { ImageViewerModal } from "@/components/ui/ImageViewerModal"

interface CampaignAvatarProperties {
  campaign: Campaign
  href?: string
  disablePopup?: boolean
  sx?: SystemStyleObject<Theme>
  disableImageViewer?: boolean
}

const CampaignAvatar = ({
  campaign,
  href,
  disablePopup,
  sx = {},
  disableImageViewer = false,
}: CampaignAvatarProperties) => {
  const avatarReference: RefObject<HTMLDivElement | null> = useRef(null)
  const [imageViewerOpen, setImageViewerOpen] = useState(false)

  const handleAvatarClick = useCallback(
    (event: React.MouseEvent) => {
      if (!disableImageViewer && campaign?.image_url) {
        event.preventDefault()
        event.stopPropagation()
        setImageViewerOpen(true)
      }
    },
    [campaign?.image_url, disableImageViewer]
  )

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (
        !disableImageViewer &&
        campaign.image_url &&
        (event.key === "Enter" || event.key === " ")
      ) {
        event.preventDefault()
        event.stopPropagation()
        setImageViewerOpen(true)
      }
    },
    [campaign?.image_url, disableImageViewer]
  )

  const handleCloseImageViewer = useCallback(() => {
    setImageViewerOpen(false)
  }, [])

  if (!campaign?.id) {
    return <></>
  }

  const initials = campaign.name
    ? campaign.name
        .split(" ")
        .map(part => part.charAt(0).toUpperCase())
        .join("")
    : ""

  const hasClickableImage = !disableImageViewer && campaign?.image_url

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
      alt={campaign.name}
      src={campaign.image_url || ""}
      ref={avatarReference}
      sx={avatarSx}
      onClick={hasClickableImage ? handleAvatarClick : undefined}
      onKeyDown={hasClickableImage ? handleKeyDown : undefined}
      role={hasClickableImage ? "button" : undefined}
      tabIndex={hasClickableImage ? 0 : undefined}
      aria-label={
        hasClickableImage
          ? `View full image of ${campaign.name}`
          : campaign.name
      }
    >
      {initials}
    </Avatar>
  )

  const avatarWithViewer = (
    <>
      {baseAvatar}
      {campaign.image_url && (
        <ImageViewerModal
          open={imageViewerOpen}
          onClose={handleCloseImageViewer}
          imageUrl={campaign.image_url}
          altText={campaign.name}
          entity={campaign}
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
        data-mention-id={campaign.id}
        data-mention-class-name="Campaign"
        sx={{ padding: 0, ml: -1.5 }}
      >
        {baseAvatar}
      </Link>
    )
  }

  return avatarWithViewer
}

export default CampaignAvatar
