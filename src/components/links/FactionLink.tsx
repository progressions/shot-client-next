import Link from "next/link"
import type { Faction } from "@/types/types"
import { FactionName } from "@/components/factions"

type FactionLinkProps = {
  faction: Faction
}

export default function FactionLink({ faction }: FactionLinkProps) {
  return (
    <Link
      href={`/factions/${faction.id}`}
      data-mention-id={faction.id}
      data-mention-class-name="Faction"
      style={{textDecoration: "underline", color: "#fff"}}
    >
      <FactionName faction={faction} />
    </Link>
  )
}
