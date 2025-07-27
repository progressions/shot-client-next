import { Link } from "@mui/material"

type WealthLinkProps = {
  wealth: string
  data?: string | object
}

export default function WealthLink({ wealth, data }: WealthLinkProps) {
  return (
    <Link
      data-mention-id={wealth}
      data-mention-class-name="Wealth"
      data-mention-data={data ? JSON.stringify(data) : undefined}
      style={{ cursor: "pointer", textDecoration: "underline", color: "#ffffff" }}
    >
      { wealth }
    </Link>
  )
}
