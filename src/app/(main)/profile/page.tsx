import { CircularProgress, Typography } from "@mui/material"
import { getCurrentUser } from "@/lib"
import type { User } from "@/types"
import { Suspense } from "react"
import { ProfilePageClient } from "@/components/users/profile"

export default async function ProfilePage() {
  const user = await getCurrentUser()
  if (!user) return <Typography>Not logged in</Typography>

  return (
    <Suspense fallback={<CircularProgress />}>
      <ProfilePageClient user={user} />
    </Suspense>
  )
}

