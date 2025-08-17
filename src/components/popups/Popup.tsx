import { Box } from "@mui/material"
import ReactDOMServer from "react-dom/server"
import { RichTextRenderer } from "@/components/editor"
import { contents } from "@/lib/info"
import pluralize from "pluralize"

type PopupProps = {
  keyword: string
}

export default function Popup({
  keyword,
}: PopupProps) {
  const word = pluralize.singular(keyword).toLowerCase()

  const content = contents[word] || <p>Unknown</p>
  const html = ReactDOMServer.renderToStaticMarkup(content)

  return (
    <Box sx={{ maxWidth: 400 }}>
      <RichTextRenderer html={html || ""} />
    </Box>
  )
}
