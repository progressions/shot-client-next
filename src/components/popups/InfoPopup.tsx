import { Typography, Box } from "@mui/material"
import { contents } from "@/lib/info"
import pluralize from "pluralize"

type InfoPopupProps = {
  keyword: string
}

export default function InfoPopup({ keyword }: InfoPopupProps) {
  const word = pluralize.singular(keyword).toLowerCase()

  const item = contents[word] || <p>Unknown</p>

  return (
    <Box sx={{ py: 2, maxWidth: 400 }}>
      <Typography variant="h6" sx={{ fontWeight: 800 }}>
        {item.title}
      </Typography>
      <Box>{item.content}</Box>
    </Box>
  )
}
