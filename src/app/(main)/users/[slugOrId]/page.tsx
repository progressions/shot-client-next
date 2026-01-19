import { redirect, isRedirectError } from "next/navigation"
import { headers } from "next/headers"
import { CircularProgress, Typography } from "@mui/material"
import { getServerClient, getCurrentUser } from "@/lib"
import type { User } from "@/types"
import { NotFound, Show } from "@/components/users"
import { Suspense } from "react"
import Breadcrumbs from "@/components/Breadcrumbs"
import { extractId, buildSluggedId, sluggedPath } from "@/lib/slug"

type UserPageProperties = {
  params: Promise<{ slugOrId: string }>
}

export default async function UserPage({ params }: UserPageProperties) {
  const { slugOrId } = await params
  const id = extractId(slugOrId)
  const client = await getServerClient()
  const currentUser = await getCurrentUser()
  if (!client || !currentUser) return <Typography>Not logged in</Typography>

  // Check admin access first before making any API calls
  if (!currentUser.admin) redirect("/")

  try {
    const response = await client.getUser({ id })
    const user: User = response.data
    const canonicalId = buildSluggedId(user.name, user.id)
    if (canonicalId !== slugOrId) {
      redirect(sluggedPath("users", user.name, user.id))
    }

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
    if (isRedirectError(error)) {
      throw error
    }
    console.error(error)
    return <NotFound />
  }
}
