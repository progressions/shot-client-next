"use client"
import { Stack, Typography } from "@mui/material"
import { JunctureDetail } from "@/components/junctures"
import { useToast } from "@/contexts"

interface JuncturesMobileProps {
  formState: {
    data: {
      junctures: Array<unknown> // Replace unknown with specific type if available
    }
  }
}

export default function JuncturesMobile({ formState }: JuncturesMobileProps) {
  const { toastSuccess } = useToast()
  const { junctures } = formState.data

  const handleDelete = async () => {
    toastSuccess("Juncture deleted successfully")
  }

  return (
    <Stack spacing={2}>
      {junctures.length === 0 && (
        <Typography sx={{ color: "#fff" }}>No junctures available</Typography>
      )}
      {junctures.map(juncture => (
        <JunctureDetail
          juncture={juncture}
          key={juncture.id}
          onDelete={handleDelete}
        />
      ))}
    </Stack>
  )
}
