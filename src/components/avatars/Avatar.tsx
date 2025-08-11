import { Avatar as MuiAvatar, Link } from "@mui/material"
import type { Entity } from "@/types"
import { SystemStyleObject, Theme } from "@mui/system"

interface AvatarProperties {
  entity: Entity
  href?: string
  disablePopup?: boolean
  sx?: SystemStyleObject<Theme>
}

const Avatar = ({ entity, href, disablePopup, sx = {} }: AvatarProperties) => {
  if (!entity?.id) {
    return <></>
  }

  const initials = entity.name
    ? entity.name
        .split(" ")
        .map(part => part.charAt(0).toUpperCase())
        .join("")
    : ""

  const baseAvatar = (
    <MuiAvatar
      alt={entity.name}
      src={entity.image_url || ""}
      data-mention-id={entity.id}
      data-mention-class-name="Faction"
      sx={sx}
    >
      {initials}
    </MuiAvatar>
  )

  if (disablePopup) {
    return baseAvatar
  }

  if (href) {
    return (
      <Link
        href={href}
        target="_blank"
        data-mention-id={entity.id}
        data-mention-class-name={entity.entity_class}
        sx={{ padding: 0, ml: -1.5 }}
      >
        {baseAvatar}
      </Link>
    )
  }

  return baseAvatar
}

export default Avatar
