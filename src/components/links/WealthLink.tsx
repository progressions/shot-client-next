import { Link } from "@mui/material"

type WealthLinkProps = {
  wealth: string
}

export default function WealthLink({ wealth }: WealthLinkProps) {
  return (
    <Link
      data-mention-id={wealth}
      data-mention-class-name="Wealth"
      style={{ cursor: "pointer", textDecoration: "underline", color: "#ffffff" }}
    >
      { wealth }
    </Link>
  )
}
