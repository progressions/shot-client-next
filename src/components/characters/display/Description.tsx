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
          mb: 2,
          borderRadius: 1,
        }}
      >
        <RichTextRenderer html={CS.description(character)} />
      </Box>
      <Stack
        direction="row"
        spacing={2}
        sx={{ mb: 2 }}
        justifyContent="space-between"
      >
        <Typography>Age: {CS.age(character)}</Typography>
        <Typography>Height: {CS.height(character)}</Typography>
        <Typography>Weight: {CS.weight(character)}</Typography>
        <Typography>Hair Color: {CS.hairColor(character)}</Typography>
        <Typography>Eye Color: {CS.eyeColor(character)}</Typography>
      </Stack>
      {CS.styleOfDress(character) && (
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
            <RichTextRenderer html={CS.styleOfDress(character)} />
          </Box>
        </Box>
      )}
      {CS.melodramaticHook(character) && (
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
            <RichTextRenderer html={CS.melodramaticHook(character)} />
          </Box>
        </Box>
      )}
      {CS.background(character) && (
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
            <RichTextRenderer html={CS.background(character)} />
          </Box>
        </Box>
      )}
    </Box>
  )
}
