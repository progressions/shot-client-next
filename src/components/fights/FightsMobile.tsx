"use client"

import { Stack, Typography } from "@mui/material"
import type { SelectChangeEvent } from "@mui/material"
import { FightDetail } from "@/components/fights"
import { useToast } from "@/contexts"

type FightsMobileProps = {
  formState
  onSortChange: (event: SelectChangeEvent<string>) => void
}

export default function FightsMobile({ formState }: FightsMobileProps) {
  const { toastSuccess } = useToast()
  const { fights } = formState.data

  const handleDelete = async () => {
    toastSuccess("Fight deleted successfully")
  }

  return (
    <Stack spacing={2}>
      {fights.length === 0 && (
        <Typography sx={{ color: "#ffffff" }}>No fights available</Typography>
      )}
      {fights.map(fight => (
        <FightDetail fight={fight} key={fight.id} onDelete={handleDelete} />
      ))}
    </Stack>
  )
}
