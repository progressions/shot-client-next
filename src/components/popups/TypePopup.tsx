import { Box, Typography, Stack } from "@mui/material"
import styles from "@/components/editor/Editor.module.scss"
import { RichTextRenderer } from "@/components/editor"
import ReactDOMServer from "react-dom/server"
import type { PopupProps } from "@/types"

const descriptions: Record<PopupProps["id"], React.ReactElement> = {
  PC: <p>A player character (PC).</p>,
  Mook: <p>A mook, a character that can be easily defeated.</p>,
  "Featured Foe": <p>A featured foe, a significant character in the story.</p>,
  Boss: <p>A boss, a powerful and challenging character.</p>,
  "Uber-Boss": (
    <p>An uber-boss, an extremely powerful and challenging character.</p>
  ),
  Ally: <p>An ally, a character that assists the player characters.</p>,
}

export default function TypePopup({ id }: PopupProps) {
  const description = descriptions[id] || <p>Unknown character type.</p>
  const html = ReactDOMServer.renderToStaticMarkup(description)

  return (
    <Box className={styles.mentionPopup}>
      <Stack direction="row" alignItems="center" spacing={2} mb={1}>
        <Typography>{id}</Typography>
      </Stack>
      <Typography variant="caption" sx={{ textTransform: "uppercase" }}>
        Type
      </Typography>
      <Box mt={1}>
        <RichTextRenderer html={html || ""} />
      </Box>
    </Box>
  )
}
