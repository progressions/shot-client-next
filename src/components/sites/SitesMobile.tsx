"use client"
import { Stack, Typography } from "@mui/material"
import { SiteDetail } from "@/components/sites"
import { useToast } from "@/contexts"

interface SitesMobileProps {
  formState: {
    data: {
      sites: Array<unknown> // Replace unknown with specific type if available
    }
  }
}

export default function SitesMobile({ formState }: SitesMobileProps) {
  const { toastSuccess } = useToast()
  const { sites } = formState.data

  const handleDelete = async () => {
    toastSuccess("Site deleted successfully")
  }

  return (
    <Stack spacing={2}>
      {sites.length === 0 && (
        <Typography sx={{ color: "#fff" }}>No sites available</Typography>
      )}
      {sites.map(site => (
        <SiteDetail site={site} key={site.id} onDelete={handleDelete} />
      ))}
    </Stack>
  )
}
