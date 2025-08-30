"use client"
import EntityLink from "./EntityLink"
import dynamic from "next/dynamic"

const SitePopup = dynamic(() => import("@/components/popups/SitePopup"), {
  ssr: false,
})

type SiteLinkProperties = {
  site: Site
  data?: string | object
  disablePopup?: boolean
  children: React.ReactNode
  sx?: React.CSSProperties
}

export default function SiteLink({
  site,
  data,
  disablePopup = false,
  children,
  sx,
}: SiteLinkProperties) {
  return (
    <EntityLink
      entity={site}
      data={data}
      disablePopup={disablePopup}
      popupOverride={SitePopup}
      sx={sx}
    >
      {children || site.name}
    </EntityLink>
  )
}
