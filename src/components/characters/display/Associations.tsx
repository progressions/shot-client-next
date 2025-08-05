import type { Character } from "@/types"
import { Stack, Typography } from "@mui/material"
import { CS } from "@/services"
import { ArchetypeLink, JunctureLink, WealthLink } from "@/components/ui"

type AssociationsProps = {
  character: Character
  omit: ("archetype" | "juncture" | "wealth")[]
}

export default function Associations({
  character,
  omit = [],
}: AssociationsProps) {
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
      {!omit.includes("archetype") && (
        <Typography
          variant="body1"
          sx={{
            color: "#ffffff",
            width: "100%",
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
      )}
      {!omit.includes("juncture") && (
        <Typography
          variant="body1"
          sx={{
            color: "#ffffff",
            width: "100%",
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
      )}
      {!omit.includes("wealth") && (
        <Typography
          variant="body1"
          sx={{
            color: "#ffffff",
            width: "100%",
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
      )}
    </Stack>
  )
}
