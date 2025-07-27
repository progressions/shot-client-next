import { Link } from "@mui/material"

type TypeLinkProps = {
  characterType: string
}

export default function TypeLink({ characterType }: TypeLinkProps) {
  return (
    <Link
      data-mention-id={characterType}
      data-mention-class-name="Type"
      style={{ cursor: "pointer", textDecoration: "underline", color: "#ffffff" }}
    >
      { characterType }
    </Link>
  )
}
