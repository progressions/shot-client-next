import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { CircularProgress, Typography } from "@mui/material"
import { getServerClient, getCurrentUser } from "@/lib/getServerClient"
import type { User } from "@/types"
import { NotFound, Show } from "@/components/users"
import { Suspense } from "react"
import Breadcrumbs from "@/components/Breadcrumbs"

type UserPageProperties = {
  params: Promise<{ id: string }>
}

export default async function UserPage({ params }: UserPageProperties) {
  const { id } = await params
  const client = await getServerClient()
  const currentUser = await getCurrentUser()
  if (!client || !currentUser) return <Typography>Not logged in</Typography>

  try {
    const response = await client.getUser({ id })
    const user: User = response.data

    if (!currentUser.admin) redirect("/")

    // Detect mobile device on the server
    const headersState = await headers()
    const userAgent = headersState.get("user-agent") || ""
    const initialIsMobile = /mobile/i.test(userAgent)

    return (
      <>
        <Breadcrumbs client={client} />
        <Suspense fallback={<CircularProgress />}>
          <Show user={user} initialIsMobile={initialIsMobile} />
        </Suspense>
      </>
    )
  } catch (error) {
    console.error(error)
    return <NotFound />
  }
}
