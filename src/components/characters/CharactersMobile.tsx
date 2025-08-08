"use client"

import { Stack, Typography } from "@mui/material"
import type { SelectChangeEvent } from "@mui/material"
import { CharacterDetail } from "@/components/characters"
import { useToast } from "@/contexts"

type CharactersMobileProps = {
  formState
  onSortChange: (event: SelectChangeEvent<string>) => void
}

export default function CharactersMobile({ formState }: CharactersMobileProps) {
  const { toastSuccess } = useToast()
  const { characters } = formState.data

  const handleDelete = async () => {
    toastSuccess("Character deleted successfully")
  }

  return (
    <Stack spacing={2}>
      {characters.length === 0 && (
        <Typography sx={{ color: "#ffffff" }}>
          No characters available
        </Typography>
      )}
      {characters.map(character => (
        <CharacterDetail
          character={character}
          key={character.id}
          onDelete={handleDelete}
        />
      ))}
    </Stack>
  )
}
