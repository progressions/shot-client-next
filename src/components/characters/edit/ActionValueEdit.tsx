"use client"

import type { Character } from "@/types"
import { Stack, Typography } from "@mui/material"
import { ActionValueLink } from "@/components/links"
import { ActionValueNumberField } from "@/components/characters"

type ActionValueProps = {
  name: string
  size: "small" | "large"
  character: Character
  setCharacter: (character: Character) => void
  updateCharacter: (updatedCharacter: Character) => Promise<void>
}

export default function ActionValue({
  name,
  size = "large",
  character,
  setCharacter,
  updateCharacter,
}: ActionValueProps) {
  return (
    <Stack
      direction="column"
      sx={{ alignItems: "flex-start", gap: 0.5, width: 130 }}
    >
      <Typography
        variant="body2"
        sx={{
          width: "110px",
          color: "#ffffff",
          fontSize: "1rem",
          textAlign: "left",
          height: "2rem",
          mt: 1,
          lineHeight: "1.5rem",
        }}
      >
        <ActionValueLink name={name} />
      </Typography>
      <ActionValueNumberField
        name={name}
        size={size}
        character={character}
        setCharacter={setCharacter}
        updateCharacter={updateCharacter}
      />
    </Stack>
  )
}
