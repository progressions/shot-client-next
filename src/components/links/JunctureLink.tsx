import Link from "next/link"
import type { Juncture } from "@/types"
import { JunctureName } from "@/components/junctures"

type JunctureLinkProperties = {
  juncture: Juncture
  data?: string | object
}

export default function JunctureLink({
  juncture,
  data,
}: JunctureLinkProperties) {
  return (
    <Link
      href={`/junctures/${juncture.id}`}
      target="_blank"
      data-mention-id={juncture.id}
      data-mention-class-name="Juncture"
      data-mention-data={data ? JSON.stringify(data) : undefined}
      style={{ fontWeight: "bold", textDecoration: "underline", color: "#fff" }}
    >
      <JunctureName juncture={juncture} />
    </Link>
  )
}
