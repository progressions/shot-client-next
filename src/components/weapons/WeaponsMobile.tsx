"use client"
import { Stack, Typography } from "@mui/material"
import type { SelectChangeEvent } from "@mui/material"
import { WeaponDetail } from "@/components/weapons"
import { useToast } from "@/contexts"

interface WeaponsMobileProps {
  formState: {
    data: {
      weapons: Array<unknown> // Replace unknown with specific type if available
    }
  }
}

export default function WeaponsMobile({ formState }: WeaponsMobileProps) {
  const { toastSuccess } = useToast()
  const { weapons } = formState.data

  const handleDelete = async () => {
    toastSuccess("Weapon deleted successfully")
  }

  return (
    <Stack spacing={2}>
      { weapons.length === 0 && (
        <Typography sx={{ color: "#fff" }}>
          No weapons available
        </Typography>
      )}
      { weapons.map(weapon => (
        <WeaponDetail
          weapon={ weapon }
          key={ weapon.id }
          onDelete={handleDelete}
        />
      ))}
    </Stack>
  )
}
