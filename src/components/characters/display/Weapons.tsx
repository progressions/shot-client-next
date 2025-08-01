import { Box, Stack, Typography } from "@mui/material"
import type { Weapon, Character } from "@/types"
import { WeaponLink } from "@/components/links"

type WeaponsProps = {
  character: Character
}

export default function Weapons({ character }: WeaponsProps) {
  if (!character.user) return null

  if (character.weapons.length === 0) return null

  return (
    <Box>
      <Typography variant="h6" mt={2}>
        Weapons
      </Typography>
      <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
        (Damage/Concealment/Reload)
      </Typography>
      <Stack direction="column" mt={2}>
        {character.weapons.map((weapon: Weapon, index: number) => (
          <Typography key={index} variant="body1" sx={{ color: "#ffffff" }}>
            <WeaponLink weapon={weapon} />
          </Typography>
        ))}
      </Stack>
    </Box>
  )
}
