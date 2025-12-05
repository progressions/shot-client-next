"use client"
import EntityLink from "./EntityLink"
import dynamic from "next/dynamic"
import { decodeHtmlEntities } from "@/lib/textUtils"
import type { Weapon } from "@/types"

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
  // Ensure entity_class is set for EntityLink
  const weaponWithClass = {
    ...weapon,
    entity_class: weapon.entity_class || "Weapon",
  }

  return (
    <EntityLink
      entity={weaponWithClass}
      data={data}
      disablePopup={disablePopup}
      popupOverride={WeaponPopup}
      sx={sx}
    >
      {children || decodeHtmlEntities(weapon.name)}
    </EntityLink>
  )
}
