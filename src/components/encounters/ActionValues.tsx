import type { Character } from "@/types"
import { CS } from "@/services"
import { Stack } from "@mui/material"
import { AV } from "@/components/ui"

type ActionValuesProps = {
  character: Character
}

export default function ActionValues({ character }: ActionValuesProps) {
  return (
    <Stack
      component="span"
      direction="row"
      flexWrap="wrap"
      rowGap={0}
      columnGap={1}
      sx={{
        fontSize: { xs: "0.75rem", md: "0.75rem" },
        width: { xs: "100%", md: "300px" },
      }}
    >
      <AV
        label={CS.mainAttack(character)}
        value={CS.mainAttackValue(character)}
      />
      <AV
        label={CS.secondaryAttack(character)}
        value={CS.secondaryAttackValue(character)}
      />
      <AV label="Defense" value={CS.defense(character)} />
      <AV
        label={CS.fortuneType(character)}
        value={CS.fortune(character)}
        maxValue={CS.maxFortune(character)}
      />
      <AV label="Toughness" value={CS.toughness(character)} />
      <AV label="Speed" value={CS.speed(character)} />
      <AV label="Damage" value={CS.damage(character)} />
    </Stack>
  )
}
