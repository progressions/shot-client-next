"use client"
import { Entity } from "@/types"
import { EntityLink } from "@/components/ui"
import { InfoPopup } from "@/components/popups"
import { Icon } from "@/components/ui"

type InfoLinkProperties = {
  info: string
  keyword?: string
  data?: string | object
  href?: string
  disablePopup?: boolean
  disableIcon?: boolean
}

export default function InfoLink({
  info,
  keyword = info,
  data,
  href,
  disablePopup = false,
  disableIcon = false,
}: InfoLinkProperties) {
  const entity: Entity = {
    id: info,
    entity_class: "Info",
  }

  return (
    <EntityLink
      entity={entity}
      data={data}
      href={href}
      disablePopup={disablePopup}
      popupOverride={InfoPopup}
      sx={{
        fontWeight: "bold",
        textDecoration: "underline",
        color: "#fff",
        cursor: "pointer",
      }}
    >
      {!disableIcon && <Icon keyword={keyword} size={16} sx={{ mr: 0.5 }} />}
      {info}
    </EntityLink>
  )
}
