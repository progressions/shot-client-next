import { Typography, Stack, Box, IconButton, Chip } from "@mui/material"
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

export default function CharacterHeader({
  character,
  location,
  onLocationClick,
}: CharacterHeaderProps) {
  const type = CS.type(character)
  const archetype = CS.archetype(character)
  const faction = CS.faction(character)?.name

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={{ xs: 0.5, sm: 1 }}
      component="span"
      sx={{ width: "100%" }}
    >
      <Box sx={{ display: { xs: "none", sm: "block" } }}>
        <Box
          sx={{
            borderRadius: "50%",
            padding: character.color ? "3px" : 0,
            background: character.color || "transparent",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <EntityAvatar entity={character} />
        </Box>
      </Box>
      <Stack
        direction="column"
        spacing={0.25}
        component="span"
        sx={{ flex: 1 }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            flexWrap: "wrap",
          }}
        >
          <CharacterLink character={character} />
          {character.status?.includes("up_check_required") && (
            <Chip
              size="small"
              label="UP CHECK"
              color="warning"
              sx={{
                height: "20px",
                fontSize: "0.7rem",
                ml: 0.5,
                fontWeight: "bold",
              }}
            />
          )}
          {character.status?.includes("out_of_fight") && (
            <Chip
              size="small"
              label="OUT"
              color="error"
              sx={{
                height: "20px",
                fontSize: "0.7rem",
                ml: 0.5,
                fontWeight: "bold",
              }}
            />
          )}
          {character.status?.includes("cheesing_it") && (
            <Chip
              size="small"
              label="ESCAPING"
              color="warning"
              sx={{
                height: "20px",
                fontSize: "0.7rem",
                ml: 0.5,
                fontWeight: "bold",
                animation: "pulse 1s infinite",
                "@keyframes pulse": {
                  "0%": { opacity: 1 },
                  "50%": { opacity: 0.6 },
                  "100%": { opacity: 1 },
                },
              }}
            />
          )}
          {character.status?.includes("cheesed_it") && (
            <Chip
              size="small"
              label="ESCAPED"
              color="success"
              sx={{
                height: "20px",
                fontSize: "0.7rem",
                ml: 0.5,
                fontWeight: "bold",
              }}
            />
          )}
          {onLocationClick && location && (
            <Chip
              size="small"
              icon={<FaMapMarkerAlt size={10} />}
              label={location}
              onClick={onLocationClick}
              sx={{
                height: "20px",
                fontSize: "0.7rem",
                ml: 1,
                "& .MuiChip-icon": {
                  fontSize: "0.7rem",
                  ml: 0.5,
                },
              }}
            />
          )}
          {onLocationClick && !location && (
            <IconButton
              size="small"
              onClick={onLocationClick}
              sx={{ p: 0.25 }}
              title="Set location"
            >
              <FaMapMarkerAlt size={12} />
            </IconButton>
          )}
        </Box>
        <Typography
          variant="caption"
          sx={{
            textTransform: "uppercase",
            fontSize: { xs: "0.65rem", sm: "0.7rem" },
            color: "text.secondary",
            letterSpacing: 0.5,
          }}
        >
          {type && (
            <>
              <Box component="span">{type}</Box>
              {(archetype || faction) && " • "}
            </>
          )}
          {archetype && faction ? (
            <>
              <Box component="span">{faction}</Box>
              {" • "}
              <Box component="span">{archetype}</Box>
            </>
          ) : archetype ? (
            <Box component="span">{archetype}</Box>
          ) : faction ? (
            <Box component="span">{faction}</Box>
          ) : (
            !type && "Character"
          )}
        </Typography>
      </Stack>
    </Stack>
  )
}
