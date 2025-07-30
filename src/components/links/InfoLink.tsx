import { Link } from "@mui/material"

type InfoLinkProperties = {
  info: string
  data?: string | object
  href?: string
}

export default function InfoLink({ info, data, href }: InfoLinkProperties) {
  return (
    <Link
      href={href}
      target="_blank"
      data-mention-id={info}
      data-mention-class-name="Info"
      data-mention-data={data ? JSON.stringify(data) : undefined}
      style={{
        fontWeight: "bold",
        cursor: "pointer",
        textDecoration: "underline",
        color: "#ffffff",
      }}
    >
      {info}
    </Link>
  )
}
