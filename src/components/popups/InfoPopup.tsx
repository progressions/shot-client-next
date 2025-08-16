import { Typography, Box } from "@mui/material"
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

  const item = contents[word] || <p>Unknown</p>

  return (
    <Box sx={{ py: 2, maxWidth: 400 }}>
      <Typography variant="h6" sx={{fontWeight: 800}}>{item.title}</Typography>
      <Box>{item.content}</Box>
    </Box>
  )
}
