import Link from "next/link"
import type { Faction } from "@/types/types"
import { FactionName } from "@/components/factions"

type FactionLinkProps = {
  faction: Faction
  data?: string | object
}

export default function FactionLink({ faction, data }: FactionLinkProps) {
  return (
    <Link
      href={`/factions/${faction.id}`}
      data-mention-id={faction.id}
      data-mention-class-name="Faction"
      data-mention-data-={data ? JSON.stringify(data) : undefined}
      style={{textDecoration: "underline", color: "#fff"}}
    >
      <FactionName faction={faction} />
    </Link>
  )
}
