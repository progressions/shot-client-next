"use client"
import EntityLink from "./EntityLink"
import dynamic from "next/dynamic"

const UserPopup = dynamic(() => import("@/components/popups/UserPopup"), {
  ssr: false,
})

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
    <EntityLink
      entity={user}
      data={data}
      disablePopup={disablePopup}
      popupOverride={UserPopup}
      sx={sx}
    >
      {children || user.name}
    </EntityLink>
  )
}
