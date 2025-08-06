import type { Weapon } from "@/types"
import { Chip } from "@mui/material"
import { Chipset } from "@/components/ui"
import { junctureColors } from "@/components/weapons/WeaponPageClient"

type WeaponChipsProps = {
  weapon: Weapon
}

export default function WeaponChips({ weapon }: WeaponChipsProps) {
  const junctureColor = junctureColors[weapon.juncture || "Modern"] || junctureColors.Modern

  return (
    <Chipset>
      {weapon.juncture && (
        <Chip
          size="medium"
          sx={{ backgroundColor: junctureColor.main }}
          label={`${weapon.juncture}`}
        />
      )}
      {weapon.category && (
        <Chip
          size="medium"
          sx={{ backgroundColor: junctureColor.main }}
          label={`${weapon.category}`}
        />
      )}
      <Chip size="medium" label={`Damage ${weapon.damage}`} />
      <Chip
        size="medium"
        label={`Concealment ${weapon.concealment || " - "}`}
      />
      <Chip size="medium" label={`Reload ${weapon.reload_value || " - "}`} />
      <Chip size="medium" label={`Mook Bonus ${weapon.mook_bonus || " - "}`} />
      {weapon.kachunk && <Chip size="medium" label={"Kachunk!"} />}
    </Chipset>
  )
}
