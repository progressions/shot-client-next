import type { Character } from "@/types"
import { Stack, Typography } from "@mui/material"
import { CS } from "@/services"
import { ArchetypeLink, JunctureLink, WealthLink } from "@/components/links"

type AssociationsProps = {
  character: Character
}

export default function Associations({ character }: AssociationsProps) {
  return (
    <Stack
      direction="column"
      spacing={1}
      sx={{
        mb: 1,
        width: "100%",
        flexWrap: "wrap",
      }}
    >
      <Typography
        variant="body1"
        sx={{
          color: "#ffffff",
          width: { xs: "100%", sm: "50%" },
          boxSizing: "border-box",
        }}
      >
        <strong>Archetype</strong>{" "}
        {CS.archetype(character) ? (
          <ArchetypeLink archetype={CS.archetype(character)} />
        ) : (
          "None"
        )}
      </Typography>
      <Typography
        variant="body1"
        sx={{
          color: "#ffffff",
          width: { xs: "100%", sm: "50%" },
          boxSizing: "border-box",
        }}
      >
        <strong>Juncture</strong>{" "}
        {character.juncture?.id ? (
          <JunctureLink juncture={character.juncture} />
        ) : (
          "None"
        )}
      </Typography>
      <Typography
        variant="body1"
        sx={{
          color: "#ffffff",
          width: { xs: "100%", sm: "50%" },
          boxSizing: "border-box",
        }}
      >
        <strong>Wealth</strong>{" "}
        {character.wealth ? (
          <WealthLink wealth={character.wealth} />
        ) : (
          "Unknown"
        )}
      </Typography>
    </Stack>
  )
}
