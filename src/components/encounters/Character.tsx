import { IconButton, Stack, Box, Typography } from "@mui/material"
import type { Character } from "@/types"
import { CS } from "@/services"
import { ActionValues } from "@/components/encounters"
import { Button, Icon } from "@/components/ui"

interface CharacterProps {
  character: Character
}

export default function Character({ character }: CharacterProps) {
  return (
    <Stack component="span" direction="row" spacing={1}>
      <Stack component="span" direction="column" spacing={1} sx={{ flexGrow: 1 }}>
        <Typography variant="caption" sx={{textTransform: "lowercase", fontVariant: "small-caps"}}>{CS.archetype(character)} {CS.faction(character)?.name && <>{" - "}{CS.faction(character)?.name}</>}</Typography>
        <ActionValues character={character} />
      </Stack>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Button variant="outlined">
          <Icon keyword="Actions" sx={{fontSize: 36, "& .MuiSvgIcon-root": { fontSize: 36 }}} />
        </Button>
      </Box>
    </Stack>
  )
}
