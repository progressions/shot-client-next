"use client"
import { Entity } from "@/types"
import { EntityLink } from "@/components/ui"
import { Popup } from "@/components/popups"

type ActionValueLinkProperties = {
  name: string
  data?: string | object
  disablePopup?: boolean
}

export default function ActionValueLink({
  name,
  data,
  disablePopup = false,
}: ActionValueLinkProperties) {
  const entity: Entity = {
    id: name,
    entity_class: "ActionValue",
  }

  return (
    <EntityLink
      entity={entity}
      data={data}
      disablePopup={disablePopup}
      popupOverride={Popup}
      sx={{
        fontWeight: "bold",
        textDecoration: "underline",
        color: "#fff",
        cursor: "pointer",
      }}
    >
      {name}
    </EntityLink>
  )
}
