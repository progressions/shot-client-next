"use client"
import { EntityLink } from "@/components/ui"

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
    <EntityLink entity={site} data={data} disablePopup={disablePopup} sx={sx}>
      {children}
    </EntityLink>
  )
}
