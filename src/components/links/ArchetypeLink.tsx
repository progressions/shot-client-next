import { Link } from "@mui/material"

type ArchetypeLinkProps = {
  archetype: string
}

export default function ArchetypeLink({ archetype }: ArchetypeLinkProps) {
  return (
    <Link
      data-mention-id={archetype}
      data-mention-class-name="Archetype"
      style={{ cursor: "pointer", textDecoration: "underline", color: "#ffffff" }}
    >
      { archetype }
    </Link>
  )
}

