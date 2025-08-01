import { Avatar, Link } from "@mui/material"
import { RefObject, useRef } from "react"
import type { Fight } from "@/types"
import { SystemStyleObject, Theme } from "@mui/system"

interface FightAvatarProperties {
  fight: Fight
  href?: string
  disablePopup?: boolean
  sx?: SystemStyleObject<Theme>
}

const FightAvatar = ({
  fight,
  href,
  disablePopup,
  sx = {},
}: FightAvatarProperties) => {
  const avatarReference: RefObject<HTMLDivElement | null> = useRef(null)

  if (!fight?.id) {
    return <></>
  }

  const initials = fight.name
    ? fight.name
        .split(" ")
        .map(part => part.charAt(0).toUpperCase())
        .join("")
    : ""

  const baseAvatar = (
    <Avatar
      alt={fight.name}
      src={fight.image_url || ""}
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
        data-mention-id={fight.id}
        data-mention-class-name="Fight"
        sx={{ padding: 0, ml: -1.5 }}
      >
        {baseAvatar}
      </Link>
    )
  }

  return baseAvatar
}

export default FightAvatar
