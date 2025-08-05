"use client"

import type { Character } from "@/types"
import { Stack, Typography } from "@mui/material"
import { ActionValueLink } from "@/components/ui"
import { ActionValueNumberField } from "@/components/characters"
import { SystemStyleObject, Theme } from "@mui/system"

type ActionValueProps = {
  name: string
  size: "small" | "large"
  character: Character
  setCharacter: (character: Character) => void
  updateCharacter: (updatedCharacter: Character) => Promise<void>
  sx?: SystemStyleObject<Theme>
}

export default function ActionValue({
  name,
  size = "large",
  character,
  setCharacter,
  updateCharacter,
  sx,
}: ActionValueProps) {
  return (
    <Stack
      direction="column"
      sx={{ alignItems: "flex-start", gap: 0.5, width: 110 }}
    >
      <Typography
        variant="body2"
        sx={{
          color: "#ffffff",
          fontSize: "1rem",
          textAlign: "left",
          height: "2rem",
          mt: 1,
          lineHeight: "1.5rem",
          ...sx,
        }}
      >
        <ActionValueLink name={name} />
      </Typography>
      <ActionValueNumberField
        name={name}
        size={size}
        width="120px"
        character={character}
        setCharacter={setCharacter}
        updateCharacter={updateCharacter}
      />
    </Stack>
  )
}
