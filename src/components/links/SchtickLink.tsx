import Link from "next/link"
import type { Schtick } from "@/types"
import { SchtickName } from "@/components/schticks"

type SchtickLinkProperties = {
  schtick: Schtick
  data?: string | object
}

export default function SchtickLink({ schtick, data }: SchtickLinkProperties) {
  return (
    <Link
      href={`/schticks/${schtick.id}`}
      target="_blank"
      data-mention-id={schtick.id}
      data-mention-class-name="Schtick"
      data-mention-data={data ? JSON.stringify(data) : undefined}
      style={{ fontWeight: "bold", textDecoration: "underline", color: "#fff" }}
    >
      <SchtickName schtick={schtick} />
    </Link>
  )
}
