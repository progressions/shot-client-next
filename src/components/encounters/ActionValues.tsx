import type { Character } from "@/types"
import { CS } from "@/services"
import { Stack, Box } from "@mui/material"

interface ActionValuesProps {
  character: Character
}

export default function ActionValues({ character }: ActionValuesProps) {
  return (
    <Box component="span" sx={{ fontSize: { xs: "0.75rem", md: "1rem" } }}>
      <Stack component="span" direction="row" spacing={1}>
        <Box component="span">
          {CS.mainAttack(character)} {CS.mainAttackValue(character)}
        </Box>
        {CS.secondaryAttack(character) && (
          <Box component="span">
            {CS.secondaryAttack(character)} {CS.secondaryAttackValue(character)}
          </Box>
        )}
        <Box component="span">Defense {CS.defense(character)}</Box>
      </Stack>
      <Stack component="span" direction="row" spacing={1}>
        <Box component="span">
          {CS.fortuneType(character)} {CS.fortune(character)} /{" "}
          {CS.maxFortune(character)}
        </Box>
        <Box component="span">Toughness {CS.toughness(character)}</Box>
        <Box component="span">Speed {CS.speed(character)}</Box>
        {!!CS.damage(character) && (
          <Box component="span">Damage {CS.damage(character)}</Box>
        )}
      </Stack>
    </Box>
  )
}
