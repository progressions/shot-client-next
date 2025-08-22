import { CircularProgress, Typography } from "@mui/material"
import { getCurrentUser } from "@/lib"
import { Suspense } from "react"
import { ProfilePageClient } from "@/components/users/profile"

export const metadata = {
  title: "Profile - Chi War",
  description: "Manage your Chi War account profile",
}

export default async function ProfilePage() {
  const user = await getCurrentUser()
  if (!user) return <Typography>Not logged in</Typography>

  return (
    <Suspense fallback={<CircularProgress />}>
      <ProfilePageClient user={user} />
    </Suspense>
  )
}
