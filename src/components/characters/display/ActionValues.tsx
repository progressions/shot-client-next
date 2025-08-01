import type { Character } from "@/types"
import { Box, Stack } from "@mui/material"
import { CS } from "@/services"
import { ActionValue } from "@/components/characters"

type ActionValuesProps = {
  character: Character
  size: "small" | "large"
}

export default function ActionValues({ character, size }: ActionValuesProps) {
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
          size={size}
        />
        <ActionValue
          name={CS.secondaryAttack(character)}
          value={CS.secondaryAttackValue(character)}
          size={size}
        />
        <ActionValue name="Defense" value={CS.defense(character)} size={size} />
        <ActionValue
          name="Toughness"
          value={CS.toughness(character)}
          size={size}
        />
        <ActionValue name="Speed" value={CS.speed(character)} size={size} />
        {CS.isPC(character) && (
          <ActionValue
            name={CS.fortuneType(character)}
            value={CS.fortune(character)}
            size={size}
          />
        )}
        {!CS.isPC(character) && (
          <ActionValue name="Damage" value={CS.damage(character)} size={size} />
        )}
      </Stack>
    </Box>
  )
}
