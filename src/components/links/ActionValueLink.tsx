import { Link } from "@mui/material"

type ActionValueLinkProps = {
  name: string
  data?: string | object
}

export default function ActionValueLink({ name, data }: ActionValueLinkProps) {
  return (
    <Link
      data-mention-id={name}
      data-mention-class-name="ActionValue"
      data-mention-data={data ? JSON.stringify(data) : undefined}
      style={{ fontWeight: "bold", cursor: "pointer", textDecoration: "underline", color: "#ffffff" }}
    >
      { name }
    </Link>
  )
}
