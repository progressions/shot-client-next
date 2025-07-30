import { Avatar, Link } from "@mui/material"
import { RefObject, useRef } from "react"
import type { Weapon } from "@/types"

interface WeaponAvatarProps {
  weapon: Weapon
  href?: string
  disablePopup?: boolean
}

const WeaponAvatar = ({ weapon, href, disablePopup }: WeaponAvatarProps) => {
  const avatarRef: RefObject<HTMLDivElement | null> = useRef(null)

  if (!weapon?.id) {
    return <></>
  }

  const initials = weapon.name
    ? weapon.name
        .split(" ")
        .map(part => part.charAt(0).toUpperCase())
        .join("")
    : ""

  const baseAvatar = (
    <Avatar alt={weapon.name} src={weapon.image_url || ""} ref={avatarRef}>
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
        data-mention-id={weapon.id}
        data-mention-class-name="Weapon"
        sx={{ padding: 0, ml: -1.5 }}
      >
        {baseAvatar}
      </Link>
    )
  }

  return baseAvatar
}

export default WeaponAvatar
