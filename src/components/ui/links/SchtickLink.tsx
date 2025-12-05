"use client"
import EntityLink from "./EntityLink"
import dynamic from "next/dynamic"

const SchtickPopup = dynamic(() => import("@/components/popups/SchtickPopup"), {
  ssr: false,
})

type SchtickLinkProperties = {
  schtick: Schtick
  data?: string | object
  disablePopup?: boolean
  children: React.ReactNode
  sx?: React.CSSProperties
}

export default function SchtickLink({
  schtick,
  data,
  disablePopup = false,
  children,
  sx,
}: SchtickLinkProperties) {
  // Ensure entity_class is set for EntityLink
  const schtickWithClass = {
    ...schtick,
    entity_class: schtick.entity_class || "Schtick",
  }

  return (
    <EntityLink
      entity={schtickWithClass}
      data={data}
      disablePopup={disablePopup}
      popupOverride={SchtickPopup}
      sx={sx}
    >
      {children || schtick.name}
    </EntityLink>
  )
}
