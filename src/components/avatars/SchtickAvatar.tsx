"use client"

import { Avatar, Link } from "@mui/material"
import { RefObject, useRef } from "react"
import type { Schtick } from "@/types"
import { SystemStyleObject, Theme } from "@mui/system"

interface SchtickAvatarProperties {
  schtick: Schtick
  href?: string
  disablePopup?: boolean
  sx?: SystemStyleObject<Theme>
}

const SchtickAvatar = ({
  schtick,
  href,
  disablePopup,
  sx = {},
}: SchtickAvatarProperties) => {
  const avatarReference: RefObject<HTMLDivElement | null> = useRef(null)

  if (!schtick?.id) {
    return <></>
  }

  const initials = schtick.name
    ? schtick.name
        .split(" ")
        .map(part => part.charAt(0).toUpperCase())
        .join("")
    : ""

  const baseAvatar = (
    <Avatar
      alt={schtick.name}
      src={schtick.image_url || ""}
      ref={avatarReference}
      sx={sx}
    >
      {initials}
    </Avatar>
  )

  if (disablePopup) {
    return baseAvatar
  }

  if (href) {
    return (
      <Link
        href={href}
        target="_blank"
        data-mention-id={schtick.id}
        data-mention-class-name="Schtick"
        sx={{ padding: 0, ml: -1.5 }}
      >
        {baseAvatar}
      </Link>
    )
  }

  return baseAvatar
}

export default SchtickAvatar
