"use client"

import type { Character } from "@/types"
import { Box, Stack } from "@mui/material"
import { CS } from "@/services"
import {
  FortuneValueEdit,
  AttackValueEdit,
  ActionValueEdit as ActionValue,
} from "@/components/characters"

type ActionValuesProps = {
  character: Character
  size: "small" | "large"
  setCharacter: (character: Character) => void
  updateCharacter: (updatedCharacter: Character) => Promise<void>
}

export default function ActionValues({
  character,
  size,
  setCharacter,
  updateCharacter,
}: ActionValuesProps) {
  return (
    <Box sx={{ display: "flex", justifyContent: "center" }}>
      <Stack
        direction="row"
        sx={{
          flexWrap: "wrap",
          columnGap: 2,
          rowGap: 3,
          mb: 3,
        }}
      >
        <AttackValueEdit
          attack="MainAttack"
          name={CS.mainAttack(character)}
          value={CS.mainAttackValue(character)}
          size={size}
          character={character}
          setCharacter={setCharacter}
          updateCharacter={updateCharacter}
        />
        <AttackValueEdit
          attack="SecondaryAttack"
          name={CS.secondaryAttack(character)}
          value={CS.secondaryAttackValue(character)}
          size={size}
          character={character}
          setCharacter={setCharacter}
          updateCharacter={updateCharacter}
        />
        <ActionValue
          name="Defense"
          value={CS.defense(character)}
          size={size}
          character={character}
          setCharacter={setCharacter}
          updateCharacter={updateCharacter}
        />
        <ActionValue
          name="Toughness"
          value={CS.toughness(character)}
          size={size}
          character={character}
          setCharacter={setCharacter}
          updateCharacter={updateCharacter}
        />
        <ActionValue
          name="Speed"
          value={CS.speed(character)}
          size={size}
          character={character}
          setCharacter={setCharacter}
          updateCharacter={updateCharacter}
        />
        {CS.isPC(character) && (
          <FortuneValueEdit
            name={CS.fortuneType(character)}
            value={CS.fortune(character)}
            size={size}
            character={character}
            setCharacter={setCharacter}
            updateCharacter={updateCharacter}
          />
        )}
        {!CS.isPC(character) && (
          <ActionValue
            name="Damage"
            value={CS.damage(character)}
            size={size}
            character={character}
            setCharacter={setCharacter}
            updateCharacter={updateCharacter}
          />
        )}
      </Stack>
    </Box>
  )
}
