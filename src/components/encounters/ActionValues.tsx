import type { Character } from "@/types"
import { CS, CES } from "@/services"
import { Stack } from "@mui/material"
import { AV } from "@/components/ui"
import { useEncounter } from "@/contexts"

type ActionValuesProps = {
  character: Character
}

export default function ActionValues({ character }: ActionValuesProps) {
  const { encounter } = useEncounter()

  // Get adjusted values with effect indicators
  const getAdjustedValue = (
    name: string,
    baseValue: number,
    ignoreImpairments: boolean = false
  ) => {
    if (!encounter) return { value: baseValue, change: 0 }

    const [change, adjustedValue] = CES.adjustedValue(
      character,
      baseValue,
      name,
      encounter,
      ignoreImpairments
    )
    return { value: adjustedValue, change }
  }

  // Get the character's attack values (MainAttack and SecondaryAttack if exists)
  const attackTypes = CS.attackValues(character)
  const attackValuesData = attackTypes.map(attackType => ({
    label: attackType,
    ...getAdjustedValue(attackType, CS.rawActionValue(character, attackType))
  }))

  const defenseData = getAdjustedValue(
    "Defense",
    CS.rawActionValue(character, "Defense")
  )
  const toughnessData = getAdjustedValue(
    "Toughness",
    CS.toughness(character),
    true
  )
  const speedData = getAdjustedValue("Speed", CS.speed(character), true)
  const damageData = getAdjustedValue("Damage", CS.damage(character), true)

  return (
    <Stack
      component="span"
      direction="row"
      sx={{
        fontSize: { xs: "0.7rem", sm: "0.75rem", md: "0.75rem" },
        width: "100%",
        gap: 0.5,
        flexWrap: "wrap",
      }}
    >
      {attackValuesData.map(attackData => (
        <AV
          key={attackData.label}
          label={attackData.label}
          value={attackData.value}
          change={attackData.change}
        />
      ))}
      <AV
        label="Defense"
        value={defenseData.value}
        change={defenseData.change}
      />
      <AV
        label="Toughness"
        value={toughnessData.value}
        change={toughnessData.change}
      />
      <AV label="Speed" value={speedData.value} change={speedData.change} />
      <AV label="Damage" value={damageData.value} change={damageData.change} />
      {CS.isPC(character) && (
        <AV
          label={CS.fortuneType(character)}
          value={CS.fortune(character)}
          maxValue={CS.maxFortune(character)}
        />
      )}
    </Stack>
  )
}
