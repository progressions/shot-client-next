import type { Character } from "@/types"
import { Box, Stack } from "@mui/material"
import { CS } from "@/services"
import { RichTextRenderer } from "@/components/editor"
import {
  Header,
  ActionValues,
  Associations,
  Skills,
  Schticks,
} from "@/components/characters"

type TemplateProps = {
  template: Character
}

export default function Template({ template }: TemplateProps) {
  return (
    <Box sx={{ width: 770, mt: 2, mx: "auto" }}>
      <Header character={template} />
      <ActionValues character={template} size="large" />
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
        <Box sx={{ flex: 1, flexGrow: 1 }}>
          <Skills character={template} />
        </Box>
        <Box sx={{ flex: 1, flexGrow: 1 }}>
          <Associations character={template} omit={["archetype"]} />
        </Box>
      </Stack>
      <Box sx={{ mb: 4 }}>
        <RichTextRenderer html={CS.background(template)} />
      </Box>
      <Schticks character={template} manage={false} />
      <p>&nbsp;</p>
    </Box>
  )
}
