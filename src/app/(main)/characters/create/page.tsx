import { CircularProgress } from "@mui/material"
import { headers } from "next/headers"
import { CreatePage } from "@/components/characters"
import { getCurrentUser, getServerClient } from "@/lib/getServerClient"
import { Suspense } from "react"
import Breadcrumbs from "@/components/Breadcrumbs"

export const metadata = {
  title: "Create Characters - Chi War",
}

export default async function CharacterCreatePage() {
  const client = await getServerClient()
  const user = await getCurrentUser()

  if (!client || !user) {
    redirect("/login")
  }

  const response = await client.getCharacters({
    is_template: true,
    sort: "name",
    order: "asc",
    per_page: 50,
  })
  const { characters } = response.data

  // Detect mobile device on the server
  const headersState = await headers()
  const userAgent = headersState.get("user-agent") || ""
  const initialIsMobile = /mobile/i.test(userAgent)

  return (
    <>
      <Breadcrumbs client={client} />
      <Suspense fallback={<CircularProgress />}>
        <CreatePage templates={characters} initialIsMobile={initialIsMobile} />
      </Suspense>
    </>
  )
}
