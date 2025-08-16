"use client"
import { Entity } from "@/types"
import { EntityLink } from "@/components/ui"
import { Popup } from "@/components/popups"

type ArchetypeLinkProperties = {
  archetype: string
  data?: string | object
  disablePopup?: boolean
}

export default function ArchetypeLink({
  archetype,
  data,
  disablePopup = false,
}: ArchetypeLinkProperties) {
  const entity: Entity = {
    id: archetype,
    entity_class: "Archetype",
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
      {archetype}
    </EntityLink>
  )
}
