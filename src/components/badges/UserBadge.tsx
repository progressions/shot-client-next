"use client"

import type { User } from "@/types"
import UserLink from "../ui/links/UserLink"
import Badge from "./Badge"
import { SystemStyleObject, Theme } from "@mui/system"

type UserBadgeProperties = {
  user: User
  size?: "sm" | "md" | "lg"
  sx?: SystemStyleObject<Theme>
}

export default function UserBadge({
  user,
  size,
  sx = {},
}: UserBadgeProperties) {
  return (
    <Badge
      name="user"
      entity={user}
      size={size}
      sx={sx}
      title={<UserLink user={user} />}
    >
      {user.email}
    </Badge>
  )
}
