"use client"
import { EntityLink } from "@/components/ui"

type UserLinkProperties = {
  user: User
  data?: string | object
  disablePopup?: boolean
  children: React.ReactNode
  sx?: React.CSSProperties
}

export default function UserLink({
  user,
  data,
  disablePopup = false,
  children,
  sx,
}: UserLinkProperties) {
  return (
    <EntityLink entity={user} data={data} disablePopup={disablePopup} sx={sx}>
      {children}
    </EntityLink>
  )
}
