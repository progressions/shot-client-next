"use client"
import type { Entity } from "@/types"
import EntityLink from "./EntityLink"
import dynamic from "next/dynamic"

const ArchetypePopup = dynamic(
  () => import("@/components/popups/ArchetypePopup"),
  { ssr: false }
)

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
      popupOverride={ArchetypePopup}
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
