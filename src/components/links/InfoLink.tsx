import { Link } from "@mui/material"

type InfoLinkProps = {
  info: string
  data?: string | object
}

export default function InfoLink({ info, data }: InfoLinkProps) {
  return (
    <Link
      data-mention-id={info}
      data-mention-class-name="Info"
      data-mention-data-={data ? JSON.stringify(data) : undefined}
      style={{ cursor: "pointer", textDecoration: "underline", color: "#ffffff" }}
    >
      { info }
    </Link>
  )
}
