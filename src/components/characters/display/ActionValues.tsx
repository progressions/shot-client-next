import type { Character } from "@/types"
import { Box, Stack } from "@mui/material"
import { CS } from "@/services"
import { ActionValue } from "@/components/characters"

type ActionValuesProps = {
  character: Character
}

export default function ActionValues({ character }: ActionValuesProps) {
  return (
    <Box sx={{ display: "flex", justifyContent: "center" }}>
      <Stack
        direction="row"
        sx={{
          flexWrap: "wrap",
          columnGap: { xs: 1, sm: 2 },
          rowGap: { xs: 1, sm: 1.5 },
          mb: 3,
        }}
      >
        <ActionValue
          name={CS.mainAttack(character)}
          value={CS.mainAttackValue(character)}
        />
        <ActionValue
          name={CS.secondaryAttack(character)}
          value={CS.secondaryAttackValue(character)}
        />
        <ActionValue name="Defense" value={CS.defense(character)} />
        <ActionValue name="Toughness" value={CS.toughness(character)} />
        <ActionValue name="Speed" value={CS.speed(character)} />
        {CS.isPC(character) && (
          <ActionValue name="Fortune" value={CS.fortune(character)} />
        )}
        {!CS.isPC(character) && (
          <ActionValue name="Damage" value={CS.damage(character)} />
        )}
      </Stack>
    </Box>
  )
}
