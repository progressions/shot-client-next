import { Avatar, Link } from "@mui/material"
import { RefObject, useRef } from "react"
import type { Party } from "@/types"
import { SystemStyleObject, Theme } from "@mui/system"

interface PartyAvatarProps {
  party: Party
  href?: string
  disablePopup?: boolean
  sx?: SystemStyleObject<Theme>
}

const PartyAvatar = ({
  party,
  href,
  disablePopup,
  sx = {},
}: PartyAvatarProps) => {
  const avatarRef: RefObject<HTMLDivElement | null> = useRef(null)

  if (!party?.id) {
    return <></>
  }

  const initials = party.name
    ? party.name
        .split(" ")
        .map(part => part.charAt(0).toUpperCase())
        .join("")
    : ""

  const baseAvatar = (
    <Avatar
      alt={party.name}
      src={party.image_url || ""}
      ref={avatarRef}
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
        data-mention-id={party.id}
        data-mention-class-name="Party"
        sx={{ padding: 0, ml: -1.5 }}
      >
        {baseAvatar}
      </Link>
    )
  }

  return baseAvatar
}

export default PartyAvatar
