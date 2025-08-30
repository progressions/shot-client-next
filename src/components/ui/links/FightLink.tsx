"use client"
import EntityLink from "./EntityLink"
import dynamic from "next/dynamic"

const FightPopup = dynamic(() => import("@/components/popups/FightPopup"), {
  ssr: false,
})

type FightLinkProperties = {
  fight: Fight
  data?: string | object
  disablePopup?: boolean
  children: React.ReactNode
  sx?: React.CSSProperties
}

export default function FightLink({
  fight,
  data,
  disablePopup = false,
  children,
  sx,
}: FightLinkProperties) {
  return (
    <EntityLink
      entity={fight}
      data={data}
      disablePopup={disablePopup}
      popupOverride={FightPopup}
      sx={sx}
    >
      {children || fight.name}
    </EntityLink>
  )
}
