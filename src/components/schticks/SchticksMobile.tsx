"use client"
import { Stack, Typography } from "@mui/material"
import type { SelectChangeEvent } from "@mui/material"
import { SchtickDetail } from "@/components/schticks"
import { useToast } from "@/contexts"

interface SchticksMobileProps {
  formState: {
    data: {
      schticks: Array<unknown> // Replace unknown with specific type if available
    }
  }
}

export default function SchticksMobile({ formState }: SchticksMobileProps) {
  const { toastSuccess } = useToast()
  const { schticks } = formState.data

  const handleDelete = async () => {
    toastSuccess("Schtick deleted successfully")
  }

  return (
    <Stack spacing={2}>
      { schticks.length === 0 && (
        <Typography sx={{ color: "#fff" }}>
          No schticks available
        </Typography>
      )}
      { schticks.map(schtick => (
        <SchtickDetail
          schtick={ schtick }
          key={ schtick.id }
          onDelete={handleDelete}
        />
      ))}
    </Stack>
  )
}
