import { CircularProgress } from "@mui/material"
import { CreatePage } from "@/components/characters"
import { getUser, getServerClient } from "@/lib/getServerClient"
import { Suspense } from "react"
import Breadcrumbs from "@/components/Breadcrumbs"

export const metadata = {
  title: "Create Characters - Chi War",
}

export default async function CharacterCreatePage() {
  const client = await getServerClient()
  const user = await getUser()

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

  return (
    <>
      <Breadcrumbs />
      <Suspense fallback={<CircularProgress />}>
        <CreatePage templates={characters} />
      </Suspense>
    </>
  )
}
