import Link from "next/link"
import type { Juncture } from "@/types/types"
import { JunctureName } from "@/components/junctures"

type JunctureLinkProps = {
  juncture: Juncture
  data?: string | object
}

export default function JunctureLink({ juncture, data }: JunctureLinkProps) {
  return (
    <Link
      href={`/junctures/${juncture.id}`}
      data-mention-id={juncture.id}
      data-mention-class-name="Juncture"
      data-mention-data-={data ? JSON.stringify(data) : undefined}
      style={{textDecoration: "underline", color: "#fff"}}
    >
      <JunctureName juncture={juncture} />
    </Link>
  )
}
