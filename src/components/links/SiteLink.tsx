import Link from "next/link"
import type { Site } from "@/types"
import { SiteName } from "@/components/sites"

type SiteLinkProperties = {
  site: Site
  data?: string | object
}

export default function SiteLink({ site, data }: SiteLinkProperties) {
  return (
    <Link
      href={`/sites/${site.id}`}
      target="_blank"
      data-mention-id={site.id}
      data-mention-class-name="Site"
      data-mention-data={data ? JSON.stringify(data) : undefined}
      style={{ fontWeight: "bold", textDecoration: "underline", color: "#fff" }}
    >
      <SiteName site={site} />
    </Link>
  )
}
