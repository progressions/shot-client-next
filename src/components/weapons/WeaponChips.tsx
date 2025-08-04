import type { Weapon } from "@/types"
import { Chip } from "@mui/material"
import { Chipset } from "@/components/ui"

type WeaponChipsProps = {
  weapon: Weapon
}

export const junctureColors: Record<
  string,
  { main: string; rgb: string; contrastText: string }
> = {
  Past: {
    main: "#6D28D9",
    rgb: "rgb(109, 40, 217)",
    contrastText: "#FFFFFF",
  },
  Modern: {
    main: "#047857",
    rgb: "rgb(4, 120, 87)",
    contrastText: "#FFFFFF",
  },
  Ancient: {
    main: "#B45309",
    rgb: "rgb(180, 83, 9)",
    contrastText: "#FFFFFF",
  },
  Future: {
    main: "#1E40AF",
    rgb: "rgb(30, 64, 175)",
    contrastText: "#FFFFFF",
  },
}

export default function WeaponChips({ weapon }: WeaponChipsProps) {
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
