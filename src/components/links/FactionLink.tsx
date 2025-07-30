import Link from "next/link"
import type { Faction } from "@/types"
import { FactionName } from "@/components/factions"

type FactionLinkProperties = {
  faction: Faction
  data?: string | object
}

export default function FactionLink({ faction, data }: FactionLinkProperties) {
  return (
    <Link
      href={`/factions/${faction.id}`}
      target="_blank"
      data-mention-id={faction.id}
      data-mention-class-name="Faction"
      data-mention-data={data ? JSON.stringify(data) : undefined}
      style={{ fontWeight: "bold", textDecoration: "underline", color: "#fff" }}
    >
      <FactionName faction={faction} />
    </Link>
  )
}
