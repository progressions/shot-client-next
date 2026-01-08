import { CircularProgress, Typography } from "@mui/material"
import { getCurrentUser } from "@/lib"
import { Suspense } from "react"
import { IntegrationsPageClient } from "@/components/integrations"

export const metadata = {
  title: "Integrations - Chi War",
  description: "Connect external services to enhance your experience",
}

export default async function IntegrationsPage() {
  const user = await getCurrentUser()
  if (!user) return <Typography>Not logged in</Typography>

  return (
    <Suspense fallback={<CircularProgress />}>
      <IntegrationsPageClient user={user} />
    </Suspense>
  )
}
