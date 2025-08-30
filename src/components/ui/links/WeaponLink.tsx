"use client"
import EntityLink from "./EntityLink"
import dynamic from "next/dynamic"

const WeaponPopup = dynamic(() => import("@/components/popups/WeaponPopup"), {
  ssr: false,
})

type WeaponLinkProperties = {
  weapon: Weapon
  data?: string | object
  disablePopup?: boolean
  children: React.ReactNode
  sx?: React.CSSProperties
}

export default function WeaponLink({
  weapon,
  data,
  disablePopup = false,
  children,
  sx,
}: WeaponLinkProperties) {
  return (
    <EntityLink
      entity={weapon}
      data={data}
      disablePopup={disablePopup}
      popupOverride={WeaponPopup}
      sx={sx}
    >
      {children || weapon.name}
    </EntityLink>
  )
}
