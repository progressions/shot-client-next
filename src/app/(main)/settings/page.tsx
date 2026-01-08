import { CircularProgress, Typography } from "@mui/material"
import { getCurrentUser } from "@/lib"
import { Suspense } from "react"
import { SettingsPageClient } from "@/components/settings"

export const metadata = {
  title: "Settings - Chi War",
  description: "Manage your security and account settings",
}

export default async function SettingsPage() {
  const user = await getCurrentUser()
  if (!user) return <Typography>Not logged in</Typography>

  return (
    <Suspense fallback={<CircularProgress />}>
      <SettingsPageClient user={user} />
    </Suspense>
  )
}
