import Link from "next/link"
import type { Party } from "@/types"
import { PartyName } from "@/components/parties"

type PartyLinkProperties = {
  party: Party
  data?: string | object
}

export default function PartyLink({ party, data }: PartyLinkProperties) {
  return (
    <Link
      href={`/parties/${party.id}`}
      target="_blank"
      data-mention-id={party.id}
      data-mention-class-name="Party"
      data-mention-data={data ? JSON.stringify(data) : undefined}
      style={{ fontWeight: "bold", textDecoration: "underline", color: "#fff" }}
    >
      <PartyName party={party} />
    </Link>
  )
}
