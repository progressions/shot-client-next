"use client"
import { EntityLink } from "@/components/ui"

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
    <EntityLink entity={weapon} data={data} disablePopup={disablePopup} sx={sx}>
      {children}
    </EntityLink>
  )
}
