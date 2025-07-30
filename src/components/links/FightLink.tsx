import Link from "next/link"
import type { Fight } from "@/types"
import { FightName } from "@/components/fights"

type FightLinkProps = {
  fight: Fight
  data?: string | object
}

export default function FightLink({ fight, data }: FightLinkProps) {
  return (
    <Link
      href={`/fights/${fight.id}`}
      target="_blank"
      data-mention-id={fight.id}
      data-mention-class-name="Fight"
      data-mention-data={data ? JSON.stringify(data) : undefined}
      style={{ fontWeight: "bold", textDecoration: "underline", color: "#fff" }}
    >
      <FightName fight={fight} />
    </Link>
  )
}
