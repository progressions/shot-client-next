"use client"
import { Stack, Typography } from "@mui/material"
import type { SelectChangeEvent } from "@mui/material"
import { FactionDetail } from "@/components/factions"
import { useToast } from "@/contexts"

interface FactionsMobileProps {
  formState: {
    data: {
      factions: Array<unknown> // Replace unknown with specific type if available
    }
  }
}

export default function FactionsMobile({ formState }: FactionsMobileProps) {
  const { toastSuccess } = useToast()
  const { factions } = formState.data

  const handleDelete = async () => {
    toastSuccess("Faction deleted successfully")
  }

  return (
    <Stack spacing={2}>
      { factions.length === 0 && (
        <Typography sx={{ color: "#fff" }}>
          No factions available
        </Typography>
      )}
      { factions.map(faction => (
        <FactionDetail
          faction={ faction }
          key={ faction.id }
          onDelete={handleDelete}
        />
      ))}
    </Stack>
  )
}
