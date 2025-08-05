"use client"

import { Avatar, Link } from "@mui/material"
import { RefObject, useRef } from "react"
import type { Faction } from "@/types"
import { SystemStyleObject, Theme } from "@mui/system"

interface FactionAvatarProperties {
  faction: Faction
  href?: string
  disablePopup?: boolean
  sx?: SystemStyleObject<Theme>
}

const FactionAvatar = ({
  faction,
  href,
  disablePopup,
  sx = {},
}: FactionAvatarProperties) => {
  const avatarReference: RefObject<HTMLDivElement | null> = useRef(null)

  if (!faction?.id) {
    return <></>
  }

  const initials = faction.name
    ? faction.name
        .split(" ")
        .map(part => part.charAt(0).toUpperCase())
        .join("")
    : ""

  const baseAvatar = (
    <Avatar
      alt={faction.name}
      src={faction.image_url || ""}
      ref={avatarReference}
      data-mention-id={faction.id}
      data-mention-class-name="Faction"
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
        data-mention-id={faction.id}
        data-mention-class-name="Faction"
        sx={{ padding: 0, ml: -1.5 }}
      >
        {baseAvatar}
      </Link>
    )
  }

  return baseAvatar
}

export default FactionAvatar
