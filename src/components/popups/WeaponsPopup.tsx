import { Box, Typography, Stack } from "@mui/material"
import type { Weapon } from "@/types"
import WS from "@/services/WeaponService"
import ImageIcon from "@mui/icons-material/Image"
import { GiDeathSkull, GiShotgun } from "react-icons/gi"

interface WeaponsPopupProperties {
  id: string
  data?: Weapon[]
}

export default function WeaponsPopup({ data }: WeaponsPopupProperties) {
  const weapons = data || []

  return (
    <>
      <Typography variant="h6">Weapons</Typography>
      <Box pt={2} sx={{ width: 500 }}>
        {weapons.map((weapon: Weapon, index: number) => (
          <Box key={weapon.name + index}>
            <Stack direction="row" spacing={1} alignItems="center">
              {weapon.image_url && <ImageIcon sx={{ color: "primary.dark" }} />}
              <Typography gutterBottom>
                {WS.nameWithCategory(weapon)} {WS.stats(weapon)}
              </Typography>
              {weapon.kachunk && (
                <Typography sx={{ color: "primary.dark" }}>
                  <GiShotgun />
                </Typography>
              )}
              {weapon.mook_bonus === 1 && (
                <>
                  <Typography sx={{ color: "primary.dark" }}>
                    <GiDeathSkull />
                  </Typography>
                </>
              )}
              {weapon.mook_bonus === 2 && (
                <>
                  <Typography sx={{ color: "primary.dark" }}>
                    <GiDeathSkull />
                    <GiDeathSkull />
                  </Typography>
                </>
              )}
            </Stack>
            {weapon.kachunk && (
              <Typography
                gutterBottom
                sx={{ marginTop: 0, marginLeft: 4, color: "primary.main" }}
                variant="subtitle2"
              >
                Damage Value is 14 if you spend a shot to go “KA-CHUNK!”
              </Typography>
            )}
            {weapon.mook_bonus === 1 && (
              <Typography
                gutterBottom
                sx={{ marginTop: 0, marginLeft: 4, color: "primary.main" }}
                variant="subtitle2"
              >
                +1 Attack vs Mooks
              </Typography>
            )}
            {weapon.mook_bonus === 2 && (
              <Typography
                gutterBottom
                sx={{ marginTop: 0, marginLeft: 4, color: "primary.main" }}
                variant="subtitle2"
              >
                +2 Attack vs Mooks
              </Typography>
            )}
          </Box>
        ))}
      </Box>
    </>
  )
}
