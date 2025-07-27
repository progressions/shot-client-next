import Link from "next/link"
import type { Party } from "@/types"
import { PartyName } from "@/components/parties"

type PartyLinkProps = {
  party: Party
  data?: string | object
}

export default function PartyLink({ party, data }: PartyLinkProps) {
  return (
    <Link
      href={`/parties/${party.id}`}
      data-mention-id={party.id}
      data-mention-class-name="Party"
      data-mention-data={data ? JSON.stringify(data) : undefined}
      style={{textDecoration: "underline", color: "#fff"}}
    >
      <PartyName party={party} />
    </Link>
  )
}
