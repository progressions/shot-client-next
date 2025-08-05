import { Link } from "@mui/material"

type WealthLinkProperties = {
  wealth: string
  data?: string | object
}

export default function WealthLink({ wealth, data }: WealthLinkProperties) {
  return (
    <Link
      data-mention-id={wealth}
      data-mention-class-name="Wealth"
      data-mention-data={data ? JSON.stringify(data) : undefined}
      style={{
        fontWeight: "bold",
        cursor: "pointer",
        textDecoration: "underline",
        color: "#ffffff",
      }}
    >
      {wealth}
    </Link>
  )
}
