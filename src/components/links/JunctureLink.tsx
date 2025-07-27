import Link from "next/link"
import type { Juncture } from "@/types/types"
import { JunctureName } from "@/components/junctures"

type JunctureLinkProps = {
  juncture: Juncture
}

export default function JunctureLink({ juncture }: JunctureLinkProps) {
  return (
    <Link
      href={`/junctures/${juncture.id}`}
      data-mention-id={juncture.id}
      data-mention-class-name="Juncture"
      style={{textDecoration: "underline", color: "#fff"}}
    >
      <JunctureName juncture={juncture} />
    </Link>
  )
}
