"use client"

import { Link, Avatar } from "@mui/material"
import { RefObject, useRef } from "react"
import type { Character } from "@/types"
import { SystemStyleObject, Theme } from "@mui/system"

interface CharacterAvatarProperties {
  character: Character
  href?: string
  disablePopup?: boolean
  sx?: SystemStyleObject<Theme>
}

const CharacterAvatar = ({
  character,
  href,
  disablePopup,
  sx = {},
}: CharacterAvatarProperties) => {
  const avatarReference: RefObject<HTMLDivElement | null> = useRef(null)

  if (!character?.id) {
    return <></>
  }

  const initials = character.name
    ? character.name
        .split(" ")
        .map((part: string) => part.charAt(0).toUpperCase())
        .join("")
    : ""

  const avatar = (
    <Avatar
      alt={character.name}
      src={character.image_url || ""}
      ref={avatarReference}
      sx={sx}
    >
      {initials}
    </Avatar>
  )

  return disablePopup ? (
    avatar
  ) : (
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

export default CharacterAvatar
