import { Box, Popover } from "@mui/material"
import ReactDOMServer from "react-dom/server"
import { RichTextRenderer } from "@/components/editor"
import { contents } from "@/components/popups/info"
import pluralize from "pluralize"

type PopupProps = {
  handleClose: () => void
  anchorEl: HTMLElement | null
  open: boolean
  keyword: string
}

export default function Popup({
  handleClose,
  anchorEl,
  open,
  keyword,
}: PopupProps) {
  const word = pluralize.singular(keyword).toLowerCase()

  console.log("Popup word", word)

  const content = contents[word] || <p>Unknown</p>
  const html = ReactDOMServer.renderToStaticMarkup(content)

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
    >
      <Box sx={{ px: 2, maxWidth: 400 }}>
        <RichTextRenderer html={html || ""} />
      </Box>
    </Popover>
  )
}
