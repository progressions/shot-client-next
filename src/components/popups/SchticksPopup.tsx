import { Box, Typography } from "@mui/material"
import type { Schtick } from "@/types"
import { RichTextRenderer } from "@/components/editor"

interface SchticksPopupProperties {
  id: string
  data?: Schtick[]
}

export default function SchticksPopup({ data }: SchticksPopupProperties) {
  const schticks = data || []

  return (
    <>
      <Typography variant="h5">Schticks</Typography>
      <Box pt={2} sx={{ width: 500 }}>
        {schticks.map((schtick: Schtick) => (
          <Typography component="div" key={schtick.id} gutterBottom>
            <Box
              component="span"
              sx={{ color: schtick.color, fontWeight: "bold" }}
            >
              {schtick.name}
            </Box>
            : <RichTextRenderer html={schtick.description || ""} />
          </Typography>
        ))}
      </Box>
    </>
  )
}
