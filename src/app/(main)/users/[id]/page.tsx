import { redirect } from "next/navigation"
import { CircularProgress, Typography } from "@mui/material"
import { getServerClient, getUser } from "@/lib/getServerClient"
import type { User } from "@/types"
import { UserPageClient } from "@/components/users"
import { Suspense } from "react"
import Breadcrumbs from "@/components/Breadcrumbs"

type UserPageProperties = {
  params: Promise<{ id: string }>
}

export default async function UserPage({ params }: UserPageProperties) {
  const { id } = await params
  const client = await getServerClient()
  const currentUser = await getUser()
  if (!client || !currentUser) return <Typography>Not logged in</Typography>

  const response = await client.getUser({ id })
  const user: User = response.data

  if (!currentUser.admin) redirect("/")

  if (!user?.id) {
    return <Typography>User not found</Typography>
  }

  return (
    <>
      <Breadcrumbs />
      <Suspense fallback={<CircularProgress />}>
        <UserPageClient user={user} />
      </Suspense>
    </>
  )
}
