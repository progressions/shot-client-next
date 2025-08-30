"use client"
import EntityLink from "./EntityLink"
import dynamic from "next/dynamic"

const JuncturePopup = dynamic(() => import("@/components/popups/JuncturePopup"), {
  ssr: false,
})

type JunctureLinkProperties = {
  juncture: Juncture
  data?: string | object
  disablePopup?: boolean
  children: React.ReactNode
  sx?: React.CSSProperties
}

export default function JunctureLink({
  juncture,
  data,
  disablePopup = false,
  children,
  sx,
}: JunctureLinkProperties) {
  return (
    <EntityLink
      entity={juncture}
      data={data}
      disablePopup={disablePopup}
      popupOverride={JuncturePopup}
      sx={sx}
    >
      {children || juncture.name}
    </EntityLink>
  )
}
