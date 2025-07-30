import { Link, Avatar } from "@mui/material"
import { RefObject, useRef } from "react"
import type { User } from "@/types"
import { SystemStyleObject, Theme } from "@mui/system"

interface UserAvatarProperties {
  user: User
  href?: string
  disablePopup?: boolean
  sx?: SystemStyleObject<Theme>
}

const UserAvatar = ({
  user,
  href,
  disablePopup,
  sx = {},
}: UserAvatarProperties) => {
  const avatarReference: RefObject<HTMLDivElement | null> = useRef(null)

  if (!user?.id) {
    return <></>
  }

  const initials = user.name
    ? user.name
        .split(" ")
        .map(part => part.charAt(0).toUpperCase())
        .join("")
    : ""

  const avatar = (
    <Avatar
      alt={user.name}
      src={user.image_url || ""}
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
      data-mention-id={user.id}
      data-mention-class-name="User"
      sx={{ padding: 0, ml: -1.5 }}
    >
      {avatar}
    </Link>
  )
}

export default UserAvatar
