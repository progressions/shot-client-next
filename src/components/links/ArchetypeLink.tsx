import { Link } from "@mui/material"

type ArchetypeLinkProps = {
  archetype: string
  data?: string | object
}

export default function ArchetypeLink({ archetype, data }: ArchetypeLinkProps) {
  return (
    <Link
      data-mention-id={archetype}
      data-mention-class-name="Archetype"
      data-mention-data={data ? JSON.stringify(data) : undefined}
      style={{ fontWeight: "bold", cursor: "pointer", textDecoration: "underline", color: "#ffffff" }}
    >
      { archetype }
    </Link>
  )
}

