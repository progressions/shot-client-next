import { Link } from "@mui/material"

type TypeLinkProps = {
  characterType: string
  data?: string | object
}

export default function TypeLink({ characterType, data }: TypeLinkProps) {
  return (
    <Link
      data-mention-id={characterType}
      data-mention-class-name="Type"
      data-mention-data={data ? JSON.stringify(data) : undefined}
      style={{ fontWeight: "bold", cursor: "pointer", textDecoration: "underline", color: "#ffffff" }}
    >
      { characterType }
    </Link>
  )
}
