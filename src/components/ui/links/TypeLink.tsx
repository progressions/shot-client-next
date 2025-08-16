"use client"
import { Entity } from "@/types"
import { EntityLink } from "@/components/ui"
import { TypePopup } from "@/components/popups"

type TypeLinkProperties = {
  characterType: string
  data?: string | object
  disablePopup?: boolean
}

export default function TypeLink({
  characterType,
  data,
  disablePopup = false,
}: TypeLinkProperties) {
  const entity: Entity = {
    id: characterType,
    entity_class: "Type",
  }

  return (
    <EntityLink
      entity={entity}
      data={data}
      disablePopup={disablePopup}
      popupOverride={TypePopup}
      sx={{
        fontWeight: "bold",
        textDecoration: "underline",
        color: "#fff",
        cursor: "pointer",
      }}
    >
      {characterType}
    </EntityLink>
  )
}
