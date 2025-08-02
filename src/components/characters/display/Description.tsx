import { Typography, Stack, Box } from "@mui/material"
import type { Character } from "@/types"
import { CS } from "@/services"
import { RichTextRenderer } from "@/components/editor"

type DescriptionProps = {
  character: Character
}

export default function Description({ character }: DescriptionProps) {
  if (CS.isMook(character)) {
    return (
      <Box>
        <Box
          sx={{
            backgroundColor: "background.paper",
            p: 2,
            mb: 2,
            borderRadius: 1,
          }}
        >
          <RichTextRenderer html={CS.description(character)} />
        </Box>
      </Box>
    )
  }

  return (
    <Box>
      <Box
        sx={{
          backgroundColor: "background.paper",
          p: 2,
          my: 2,
          borderRadius: 1,
        }}
      >
        <RichTextRenderer html={CS.description(character) || "No description available."} />
      </Box>
      <Stack
        direction="row"
        spacing={2}
        sx={{ my: 2 }}
        justifyContent="space-between"
      >
        <Typography>Age: {CS.age(character) || "Unknown"}</Typography>
        <Typography>Height: {CS.height(character) || "Unknown"}</Typography>
        <Typography>Weight: {CS.weight(character) || "Unknown"}</Typography>
        <Typography>Hair Color: {CS.hairColor(character) || "Unknown"}</Typography>
        <Typography>Eye Color: {CS.eyeColor(character) || "Unknown"}</Typography>
      </Stack>
      <Box>
        <Typography variant="h6">Style of Dress</Typography>
        <Box
          sx={{
            backgroundColor: "background.paper",
            p: 2,
            mb: 2,
            borderRadius: 1,
          }}
        >
          <RichTextRenderer html={CS.styleOfDress(character) || "No information available."} />
        </Box>
      </Box>
      {CS.isPC(character) && (
        <Box>
          <Typography variant="h6">Melodramatic Hook</Typography>
          <Box
            sx={{
              backgroundColor: "background.paper",
              p: 2,
              mb: 2,
              borderRadius: 1,
            }}
          >
            <RichTextRenderer html={CS.melodramaticHook(character) || "No information available."} />
          </Box>
        </Box>
      )}
      <Box>
        <Typography variant="h6">Background</Typography>
        <Box
          sx={{
            backgroundColor: "background.paper",
            p: 2,
            mb: 2,
            borderRadius: 1,
          }}
        >
          <RichTextRenderer html={CS.background(character) || "No information available."} />
        </Box>
      </Box>
    </Box>
  )
}
