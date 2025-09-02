import { Typography, Stack, Box, IconButton } from "@mui/material"
import { type Character } from "@/types"
import { CharacterLink } from "@/components/ui"
import { EntityAvatar } from "@/components/avatars"
import { CS } from "@/services"
import { FaMapMarkerAlt } from "react-icons/fa"

type CharacterHeaderProps = {
  character: Character
  location?: string
  onLocationClick?: () => void
}

export default function CharacterHeader({ character, location, onLocationClick }: CharacterHeaderProps) {
  const divider = CS.archetype(character) && CS.faction(character) ? " - " : ""
  return (
    <Stack direction="row" spacing={1} component="span">
      <EntityAvatar entity={character} />
      <Stack direction="column" spacing={0} component="span">
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <CharacterLink character={character} />
          {onLocationClick && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                color: "text.secondary",
                fontStyle: "italic",
              }}
            >
              <IconButton
                size="small"
                onClick={onLocationClick}
                sx={{ p: 0.5, color: "inherit" }}
              >
                <FaMapMarkerAlt size={12} />
              </IconButton>
              {location && (
                <Typography variant="caption" sx={{ fontSize: "0.75rem" }}>
                  {location}
                </Typography>
              )}
            </Box>
          )}
        </Box>
        <Typography
          variant="caption"
          sx={{ textTransform: "lowercase", fontVariant: "small-caps" }}
        >
          {CS.archetype(character)}
          {divider}
          {CS.faction(character)?.name}
        </Typography>
      </Stack>
    </Stack>
  )
}
