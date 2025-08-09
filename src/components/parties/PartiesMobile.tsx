"use client"
import { Stack, Typography } from "@mui/material"
import type { SelectChangeEvent } from "@mui/material"
import { PartyDetail } from "@/components/parties"
import { useToast } from "@/contexts"

interface PartiesMobileProps {
  formState: {
    data: {
      parties: Array<unknown> // Replace unknown with specific type if available
    }
  }
}

export default function PartiesMobile({ formState }: PartiesMobileProps) {
  const { toastSuccess } = useToast()
  const { parties } = formState.data

  const handleDelete = async () => {
    toastSuccess("Party deleted successfully")
  }

  return (
    <Stack spacing={2}>
      { parties.length === 0 && (
        <Typography sx={{ color: "#fff" }}>
          No parties available
        </Typography>
      )}
      { parties.map(party => (
        <PartyDetail
          party={ party }
          key={ party.id }
          onDelete={handleDelete}
        />
      ))}
    </Stack>
  )
}
