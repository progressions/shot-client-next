import { Link } from "@mui/material"

type ActionValueLinkProps = {
  name: string
}

export default function ActionValueLink({ name }: ActionValueLinkProps) {
  return (
    <Link
      data-mention-id={name}
      data-mention-class-name="ActionValue"
      style={{ cursor: "pointer", textDecoration: "underline", color: "#ffffff" }}
    >
      { name }
    </Link>
  )
}
